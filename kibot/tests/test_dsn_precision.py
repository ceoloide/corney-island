import sys
import unittest
from decimal import Decimal
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from dsn_precision import CoordinateIndex, PrecisionError, SourceGeometry, normalize_npth, parse, restore


class PrecisionTests(unittest.TestCase):
    def fixture(self):
        return '''(pcb example
          (parser (string_quote ") (space_in_quoted_tokens on))
          (unit um) (resolution um 10)
          (structure (boundary (path pcb 0 200000 100000 210000 100000))
                     (keepout "intentional" (circle F.Cu 5400))
                     (rule (clearance 200)))
          (placement) (library)
          (wiring (wire (path F.Cu 150 200000 -100000 210000 -100000)
                        (net "N (test)") (type route))
                  (via "Via[0-1]_560:300_um" 200000 -100000 (net "N (test)"))))'''

    def source(self):
        source = SourceGeometry()
        source.wires['N (test)', 'F.Cu'].add(('200000.123', '-100000.456'))
        source.wires['N (test)', 'F.Cu'].add(('210000.123', '-100000.456'))
        source.vias['N (test)'].add(('200000.123', '-100000.456'))
        source.outline.add(('200000.123', '100000.456'))
        source.outline.add(('210000.123', '100000.456'))
        return source

    def test_recovers_source_digits_and_preserves_descriptors(self):
        result, counts = restore(self.fixture(), self.source())
        self.assertIn('200000.123 -100000.456', result)
        self.assertEqual(counts, {'wire': 4, 'via': 2, 'outline': 4})
        self.assertIn('(resolution um 10)', result)
        self.assertIn('(keepout "intentional" (circle F.Cu 5400))', result)
        self.assertIn('(rule (clearance 200))', result)
        self.assertIn('(net "N (test)")', result)

    def test_repair_is_idempotent(self):
        first, _ = restore(self.fixture(), self.source())
        second, counts = restore(first, self.source())
        self.assertEqual(first, second)
        self.assertEqual(counts, {})

    def test_rounding_collision_rejected_even_when_one_point_is_exact(self):
        index = CoordinateIndex()
        index.add(('200000', '100000'))
        index.add(('200000.123', '100000'))
        with self.assertRaisesRegex(PrecisionError, '2 source matches'):
            index.resolve((Decimal('200000'), Decimal('100000')), 'wire')

    def test_nearby_point_is_not_a_source_match(self):
        index = CoordinateIndex()
        index.add(('200001', '100000'))
        with self.assertRaisesRegex(PrecisionError, '0 source matches'):
            index.resolve((Decimal('200000'), Decimal('100000')), 'wire')

    def test_net_and_layer_are_required(self):
        source = self.source()
        source.wires['N (test)', 'B.Cu'] = source.wires.pop(('N (test)', 'F.Cu'))
        with self.assertRaises(PrecisionError):
            restore(self.fixture(), source)

    def test_unsupported_units_rejected(self):
        with self.assertRaisesRegex(PrecisionError, 'micrometer'):
            restore(self.fixture().replace('(unit um)', '(unit mil)'), self.source())

    def test_quoted_identifiers_comments_and_malformed_input(self):
        node = parse('(pcb "name (with) spaces" ; comment\n(parser (string_quote ")) (unknown "a\\"b"))')
        self.assertEqual(node.children[1].value, 'name (with) spaces')
        self.assertEqual(node.nodes('unknown')[0].children[1].value, 'a"b')
        with self.assertRaises(PrecisionError):
            parse('(pcb missing) extra')

    def test_shared_rounded_image_is_split_without_changing_references(self):
        text = '''(pcb example (unit um) (resolution um 10)
          (structure) (wiring)
          (placement (component shared
            (place A 10 -20 front 15) (place B 30 -40 back 345)))
          (library (image shared (pin PS 1 0 7075)
                    (keepout "intentional" (circle F.Cu 5400)))))'''
        source = SourceGeometry()
        for ref, origin, y in [('A', ('10', '-20'), '7075'), ('B', ('30', '-40'), '7075.001')]:
            pins = {'1': CoordinateIndex()}
            pins['1'].add(('0', y))
            source.footprints[ref] = tuple(map(Decimal, origin)), pins, {}
        restored, counts = restore(text, source)
        root = parse(restored)
        self.assertEqual(counts['images_split'], 1)
        images = root.nodes('library')[0].nodes('image')
        self.assertEqual(len(images), 2)
        self.assertEqual({i.nodes('pin')[0].children[-1].value for i in images}, {'7075', '7075.001'})
        places = [p for c in root.nodes('placement')[0].nodes('component') for p in c.nodes('place')]
        self.assertEqual({p.children[1].value for p in places}, {'A', 'B'})
        self.assertEqual(restored.count('(keepout "intentional" (circle F.Cu 5400))'), 2)
        second, counts = restore(restored, source)
        self.assertEqual(restored, second)
        self.assertEqual(counts, {})

    def npth_fixture(self):
        source = SourceGeometry()
        source.npth['H1'] = [((Decimal('1.001'), Decimal('2')), Decimal('5400'), Decimal('5100'), ('F.Cu', 'B.Cu'))]
        text = '''(pcb example (placement (component hole (place H1 0 0 front 0)))
          (library (image hole
            (keepout "" (circle F.Cu 5400 1.001 2))
            (keepout "" (circle B.Cu 5400 1.001 2))
            (keepout "intentional" (circle F.Cu 5400 1.001 2))
            (keepout "" (circle F.Cu 5400 3 4))
            (keepout "" (circle Other 5400 1.001 2)))))'''
        return text, source

    def test_npth_normalization_requires_identity_center_layer_and_diameter(self):
        text, source = self.npth_fixture()
        result, count = normalize_npth(text, source)
        self.assertEqual(count, 2)
        self.assertEqual(result.count('5100'), 2)
        self.assertIn('(keepout "intentional" (circle F.Cu 5400 1.001 2))', result)
        self.assertIn('(circle F.Cu 5400 3 4)', result)
        self.assertIn('(circle Other 5400 1.001 2)', result)
        self.assertEqual(normalize_npth(result, source), (result, 0))

    def test_npth_rule_areas_rejected(self):
        text, source = self.npth_fixture()
        source.has_rule_areas = True
        with self.assertRaisesRegex(PrecisionError, 'rule areas'):
            normalize_npth(text, source)

    def test_npth_implicit_origin(self):
        text, source = self.npth_fixture()
        source.npth['H1'] = [((Decimal(0), Decimal(0)), Decimal('5400'), Decimal('5000'), ('F.Cu',))]
        text = text.replace('F.Cu 5400 1.001 2', 'F.Cu 5400')
        result, count = normalize_npth(text, source)
        self.assertEqual(count, 1)
        self.assertIn('(keepout "" (circle F.Cu 5000))', result)
        self.assertIn('(keepout "intentional" (circle F.Cu 5400))', result)

    def test_shared_npth_extent_conflict_rejected(self):
        text, source = self.npth_fixture()
        text = text.replace('(place H1 0 0 front 0)', '(place H1 0 0 front 0) (place H2 0 0 front 0)')
        source.npth['H2'] = [((Decimal('1.001'), Decimal('2')), Decimal('5400'), Decimal('5000'), ('F.Cu', 'B.Cu'))]
        with self.assertRaisesRegex(PrecisionError, 'Conflicting NPTH'):
            normalize_npth(text, source)


if __name__ == '__main__':
    unittest.main()
