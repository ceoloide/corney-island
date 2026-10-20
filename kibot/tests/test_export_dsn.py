"""Exercise the export entry point, including default NPTH repair and atomic failure."""
from decimal import Decimal
from pathlib import Path
from zipfile import ZipFile
import sys
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import export_dsn
from dsn_precision import PrecisionError, SourceGeometry
from check_freerouting import verify


class ExportTests(unittest.TestCase):
    def run_export(self, native=False, rule_area=False):
        source = SourceGeometry()
        source.has_rule_areas = rule_area
        source.footprints['H1'] = (Decimal(0), Decimal(0)), {}, {}
        source.npth['H1'] = [((Decimal(0), Decimal(0)), Decimal(5400), Decimal(5000), ('F.Cu',))]
        text = '''(pcb example (unit um) (resolution um 10) (structure) (wiring)
          (placement (component hole (place H1 0 0 front 0)))
          (library (image hole (keepout "" (circle F.Cu 5400))
            (keepout intentional (circle F.Cu 5400)))))'''
        def export(board, output):
            Path(output).write_text(text)
            return True
        pcbnew = SimpleNamespace(LoadBoard=lambda path: object(), ExportSpecctraDSN=export)
        with tempfile.TemporaryDirectory() as temporary:
            target = Path(temporary) / 'output.dsn'
            target.write_text('previous output')
            argv = ['export_dsn.py', '-b', 'source.kicad_pcb', '-o', str(target)]
            if native:
                argv.append('--keep-native-npth')
            with patch.dict(sys.modules, pcbnew=pcbnew), patch.object(sys, 'argv', argv), \
                    patch.object(SourceGeometry, 'from_board', return_value=source):
                if rule_area and not native:
                    with self.assertRaises(PrecisionError):
                        export_dsn.main()
                    self.assertEqual(target.read_text(), 'previous output')
                    self.assertEqual(list(Path(temporary).glob('.precision-*')), [])
                    return
                export_dsn.main()
            self.assertEqual(target.stat().st_mode & 0o777, 0o644)
            result = target.read_text()
            self.assertIn('(keepout intentional (circle F.Cu 5400))', result)
            self.assertIn('(keepout "" (circle F.Cu ' + ('5400' if native else '5000') + '))', result)

    def test_default_normalizes_source_proven_npth(self):
        self.run_export()

    def test_native_opt_out(self):
        self.run_export(native=True, rule_area=True)

    def test_unsupported_rule_area_preserves_previous_output(self):
        self.run_export(rule_area=True)

    def test_stale_binary_rejected(self):
        with tempfile.TemporaryDirectory() as temporary:
            jar = Path(temporary) / 'stale.jar'
            with ZipFile(jar, 'w') as archive:
                archive.writestr('META-INF/MANIFEST.MF', 'Build-Revision: old\n')
                archive.writestr('app/freerouting/constants/Constants.class', b'\x01\x00\x052.5.0')
            with self.assertRaisesRegex(ValueError, '2.5.1-SNAPSHOT'):
                verify(jar, {'version': '2.5.1-SNAPSHOT', 'revision': 'new'})
            with self.assertRaisesRegex(ValueError, 'revision new'):
                verify(jar, {'version': '2.5.0', 'revision': 'new'})
