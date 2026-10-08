"""Restore KiCad DSN coordinates by exact source matching, never proximity."""
from collections import Counter, defaultdict
from dataclasses import dataclass
from decimal import Decimal
import re
import hashlib


class PrecisionError(ValueError):
    pass


@dataclass
class Atom:
    value: str
    start: int
    end: int


@dataclass
class Node:
    children: list
    start: int = 0
    end: int = 0

    @property
    def kind(self):
        return self.children[0].value if self.children and isinstance(self.children[0], Atom) else ''

    def nodes(self, kind):
        return [n for n in self.children if isinstance(n, Node) and n.kind == kind]


def parse(text):
    """Parse lists, retaining token spans and the unpaired (string_quote ") atom."""
    tokens = []
    i = 0
    while i < len(text):
        if text[i].isspace():
            i += 1
            continue
        if text[i] == ';':
            end = text.find('\n', i)
            i = len(text) if end < 0 else end + 1
            continue
        start = i
        if text[i] in '()':
            tokens.append((text[i], i))
            i += 1
        elif text[i] == '"' and tokens and isinstance(tokens[-1], Atom) and tokens[-1].value == 'string_quote':
            tokens.append(Atom('"', i, i + 1))
            i += 1
        elif text[i] == '"':
            i += 1
            value = ''
            while i < len(text) and text[i] != '"':
                if text[i] == '\\':
                    i += 1
                    if i == len(text):
                        raise PrecisionError('Unterminated quoted DSN identifier')
                value += text[i]
                i += 1
            if i == len(text):
                raise PrecisionError('Unterminated quoted DSN identifier')
            i += 1
            tokens.append(Atom(value, start, i))
        else:
            while i < len(text) and not text[i].isspace() and text[i] not in '()':
                i += 1
            tokens.append(Atom(text[start:i], start, i))
    stack, roots = [], []
    for token in tokens:
        if isinstance(token, tuple) and token[0] == '(':
            node = Node([], token[1])
            (stack[-1].children if stack else roots).append(node)
            stack.append(node)
        elif isinstance(token, tuple) and token[0] == ')':
            if not stack:
                raise PrecisionError('Unbalanced DSN parentheses')
            stack.pop().end = token[1] + 1
        elif stack:
            stack[-1].children.append(token)
        else:
            raise PrecisionError('Unexpected DSN token outside a list')
    if stack or len(roots) != 1 or roots[0].kind != 'pcb':
        raise PrecisionError('Expected one complete DSN pcb descriptor')
    return roots[0]


def number(atom):
    if not isinstance(atom, Atom):
        raise PrecisionError('Expected numeric DSN atom')
    return Decimal(atom.value)


def render(value):
    value = Decimal(value)
    if not value:
        return '0'
    text = format(value, 'f')
    return text.rstrip('0').rstrip('.') if '.' in text else text


def rounded(value):
    return Decimal(format(float(value), '.6g'))


def xy(point):
    return Decimal(point.x) / 1000, -Decimal(point.y) / 1000


class CoordinateIndex:
    def __init__(self):
        self.points = defaultdict(set)

    def add(self, point):
        point = tuple(map(Decimal, point))
        self.points[tuple(map(rounded, point))].add(point)

    def resolve(self, point, context):
        point = tuple(map(Decimal, point))
        candidates = self.points.get(tuple(map(rounded, point)), set())
        if len(candidates) != 1:
            raise PrecisionError(f'{context}: {len(candidates)} source matches for {point}; refusing to guess')
        return next(iter(candidates))


class SourceGeometry:
    def __init__(self):
        self.wires = defaultdict(CoordinateIndex)
        self.vias = defaultdict(CoordinateIndex)
        self.outline = CoordinateIndex()
        self.footprints = {}
        self.npth = {}
        self.has_rule_areas = False

    @classmethod
    def from_board(cls, board, pcbnew):
        result = cls()
        zones = list(board.Zones())
        for footprint in board.GetFootprints():
            zones.extend(footprint.Zones())
        result.has_rule_areas = any(zone.GetIsRuleArea() for zone in zones)
        for item in board.GetTracks():
            if isinstance(item, pcbnew.PCB_ARC):
                raise PrecisionError('Arc tracks are not supported by source-coordinate restoration')
            if isinstance(item, pcbnew.PCB_VIA):
                result.vias[item.GetNetname()].add(xy(item.GetPosition()))
            else:
                index = result.wires[item.GetNetname(), board.GetLayerName(item.GetLayer())]
                index.add(xy(item.GetStart()))
                index.add(xy(item.GetEnd()))
        outlines = pcbnew.SHAPE_POLY_SET()
        if not board.GetBoardPolygonOutlines(outlines):
            raise PrecisionError('Malformed board outline; run KiCad DRC before DSN export')
        for i in range(outlines.OutlineCount()):
            chains = [outlines.COutline(i)]
            chains.extend(outlines.CHole(i, j) for j in range(outlines.HoleCount(i)))
            for chain in chains:
                for j in range(chain.PointCount()):
                    result.outline.add(xy(chain.CPoint(j)))
        for fp in board.GetFootprints():
            ref = fp.GetReference()
            if ref in result.footprints:
                raise PrecisionError(f'Duplicate footprint reference {ref}')
            origin = xy(fp.GetPosition())
            if fp.GetLayer() == pcbnew.B_Cu:
                fp.Flip(fp.GetPosition(), pcbnew.FLIP_DIRECTION_TOP_BOTTOM)
            pins = defaultdict(CoordinateIndex)
            holes = defaultdict(CoordinateIndex)
            npth = []
            for pad in fp.Pads():
                local = xy(pad.GetFPRelativePosition())
                pins[pad.GetNumber()].add(local)
                if (pad.GetAttribute() == pcbnew.PAD_ATTRIB_NPTH
                        and pad.GetDrillSize().x == pad.GetDrillSize().y
                        and pad.GetShape() == pcbnew.PAD_SHAPE_CIRCLE
                        and (pad.GetDrillSize().x >= pad.GetSize().x
                             or not any(pad.IsOnLayer(layer) for layer in range(pcbnew.PCB_LAYER_ID_COUNT)
                                        if pcbnew.IsCopperLayer(layer)))):
                    diameter = Decimal(pad.GetDrillSize().x + 2 * board.GetDesignSettings().m_HoleClearance) / 1000
                    holes[rounded(diameter)].add(local)
                    extent = Decimal(max(pad.GetDrillSize().x, pad.GetSize().x)) / 1000
                    npth.append((local, diameter, extent,
                                 tuple(board.GetLayerName(layer) for layer in board.GetEnabledLayers().CuStack())))
            result.footprints[ref] = origin, pins, holes
            result.npth[ref] = npth
        return result


def split_rounded_images(text, source):
    """Separate instances whose source pins differ but share one rounded image.

    KiCad compares some image descriptors via their serialized text. A single
    shared image cannot represent differing original coordinates faithfully.
    """
    root = parse(text)
    libraries, placements = root.nodes('library'), root.nodes('placement')
    if len(libraries) != 1 or len(placements) != 1:
        raise PrecisionError('Expected one library and placement descriptor')
    library = libraries[0]
    images = {image.children[1].value: image for image in library.nodes('image')}
    edits, split_count = [], 0
    for component in placements[0].nodes('component'):
        name = component.children[1].value
        groups = defaultdict(list)
        for place in component.nodes('place'):
            ref = place.children[1].value
            if ref not in source.footprints:
                raise PrecisionError(f'Unknown footprint {ref}')
            _, pins, holes = source.footprints[ref]
            def signature(indexes):
                return tuple(sorted((str(key), tuple(sorted(p for points in index.points.values() for p in points)))
                                    for key, index in indexes.items()))
            groups[signature(pins), signature(holes), tuple(sorted(source.npth.get(ref, [])))].append(place)
        if len(groups) <= 1:
            continue
        if len(component.children) != 2 + len(component.nodes('place')):
            raise PrecisionError('Cannot split image with unknown component descriptors')
        original = images[name]
        components, copies = [], []
        for i, (sig, places) in enumerate(groups.items()):
            variant = name if i == 0 else name + '__precision_' + hashlib.sha256(repr(sig).encode()).hexdigest()[:12]
            if i and variant in images:
                raise PrecisionError(f'Precision image identifier collision: {variant}')
            quoted = '"' + variant.replace('\\', '\\\\').replace('"', '\\"') + '"'
            atom = original.children[1]
            copy = text[original.start:atom.start] + quoted + text[atom.end:original.end]
            copies.append(copy)
            components.append('(component ' + quoted + '\n' + '\n'.join(text[p.start:p.end] for p in places) + ')')
        edits.append((component.start, component.end, '\n'.join(components)))
        edits.append((original.start, original.end, '\n'.join(copies)))
        split_count += len(groups) - 1
    for start, end, value in sorted(edits, reverse=True):
        text = text[:start] + value + text[end:]
    return text, split_count


def restore(text, source):
    text, split_count = split_rounded_images(text, source)
    root = parse(text)
    units, resolution = root.nodes('unit'), root.nodes('resolution')
    if not units or units[0].children[1].value != 'um' or not resolution or resolution[0].children[1].value != 'um':
        raise PrecisionError('Precision restoration supports KiCad micrometer DSN export only')
    replacements, counts = {}, Counter()
    if split_count:
        counts['images_split'] = split_count

    def replace(atom, value, category):
        value = Decimal(value)
        if number(atom) != value:
            new = render(value)
            old = replacements.get((atom.start, atom.end))
            if old is not None and old != new:
                raise PrecisionError(f'Conflicting source values in {category}')
            replacements[atom.start, atom.end] = new
            counts[category] += 1

    def point(atoms, index, category):
        if len(atoms) != 2:
            raise PrecisionError(f'Expected coordinate pair in {category}')
        restored = index.resolve(tuple(number(a) for a in atoms), category)
        for atom, value in zip(atoms, restored):
            replace(atom, value, category)

    def child(node, kind):
        nodes = node.nodes(kind)
        if len(nodes) != 1:
            raise PrecisionError(f'Expected one {kind} in {node.kind}')
        return nodes[0]

    wiring = child(root, 'wiring')
    for wire in wiring.nodes('wire'):
        path = child(wire, 'path')
        net = child(wire, 'net').children[1].value
        layer = path.children[1].value
        coords = path.children[3:]
        if len(coords) % 2:
            raise PrecisionError('Odd number of wire coordinates')
        for i in range(0, len(coords), 2):
            point(coords[i:i + 2], source.wires[net, layer], 'wire')
    for via in wiring.nodes('via'):
        net = child(via, 'net').children[1].value
        point(via.children[2:4], source.vias[net], 'via')
    for boundary in child(root, 'structure').nodes('boundary'):
        for path in boundary.nodes('path'):
            coords = path.children[3:]
            for i in range(0, len(coords), 2):
                point(coords[i:i + 2], source.outline, 'outline')
    images = defaultdict(list)
    for component in child(root, 'placement').nodes('component'):
        image = component.children[1].value
        for place in component.nodes('place'):
            ref = place.children[1].value
            if ref not in source.footprints:
                raise PrecisionError(f'Unknown footprint {ref}')
            origin, pins, holes = source.footprints[ref]
            for atom, value in zip(place.children[2:4], origin):
                replace(atom, value, 'placement')
            images[image].append((pins, holes))
    for image in child(root, 'library').nodes('image'):
        members = images.get(image.children[1].value, [])
        if not members:
            continue
        for pin in image.nodes('pin'):
            offset = 3 if isinstance(pin.children[2], Node) else 2
            name = pin.children[offset].value
            base = re.sub(r'@\d+$', '', name)
            index = CoordinateIndex()
            for pins, _ in members:
                candidates = pins.get(name) or pins.get(base)
                if candidates:
                    for points in candidates.points.values():
                        for value in points:
                            index.add(value)
            point(pin.children[offset + 1:offset + 3], index, 'pin')
        for keepout in image.nodes('keepout'):
            circles = keepout.nodes('circle')
            if not circles or len(circles[0].children) != 5:
                continue
            circle, index = circles[0], CoordinateIndex()
            for _, holes in members:
                candidate = holes.get(rounded(number(circle.children[2])))
                if candidate:
                    for points in candidate.points.values():
                        for value in points:
                            index.add(value)
            if index.points:
                point(circle.children[3:5], index, 'npth_center')
    for (start, end), value in sorted(replacements.items(), reverse=True):
        text = text[:start] + value + text[end:]
    parse(text)
    return text, dict(counts)


def normalize_npth(text, source):
    """Remove KiCad's baked-in hole margin only from source-proven NPTH circles."""
    if source.has_rule_areas:
        raise PrecisionError('NPTH normalization requires a board without rule areas; use --keep-native-npth')
    root = parse(text)
    members = defaultdict(list)
    for placement in root.nodes('placement'):
        for component in placement.nodes('component'):
            for place in component.nodes('place'):
                members[component.children[1].value].append(place.children[1].value)
    edits = []
    for library in root.nodes('library'):
        for image in library.nodes('image'):
            refs = members[image.children[1].value]
            for keepout in image.nodes('keepout'):
                circles = keepout.nodes('circle')
                if len(keepout.children) != 3 or keepout.children[1].value != '' or len(circles) != 1:
                    continue
                circle = circles[0]
                if len(circle.children) not in (3, 5):
                    continue
                layer, diameter = circle.children[1].value, number(circle.children[2])
                center = tuple(number(a) for a in circle.children[3:5]) if len(circle.children) == 5 else (Decimal(0), Decimal(0))
                extents = set()
                for ref in refs:
                    matches = {extent for local, expanded, extent, layers in source.npth.get(ref, [])
                               if center == local and layer in layers
                               and diameter in (rounded(expanded), expanded, extent)}
                    if len(matches) != 1:
                        break
                    extents.update(matches)
                else:
                    if refs and len(extents) != 1:
                        raise PrecisionError('Conflicting NPTH extents in shared image')
                    if refs and diameter != next(iter(extents)):
                        atom = circle.children[2]
                        edits.append((atom.start, atom.end, render(next(iter(extents)))))
    for start, end, value in sorted(edits, reverse=True):
        text = text[:start] + value + text[end:]
    return text, len(edits)
