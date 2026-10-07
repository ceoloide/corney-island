#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys, getopt, re
import pcbnew
"""
This program runs pcbnew and exports a Specctra DSN file. 
"""

def main(argv):
  board_file = ''
  output_file = ''
  try:
    opts, args = getopt.getopt(argv, "hb:o:",["board=","output="])
  except getopt.GetoptError:
    print ('export_dsn.py -b <board_file> -o <ouput_dsn_file>')
    sys.exit(2)
  for opt, arg in opts:
    if opt == '-h': 
      print ('export_dsn.py -b <board_file> -o <ouput_dsn_file>')
      sys.exit()
    elif opt in ("-b", "--board"):
      board_file = arg
    elif opt in ("-o", "--output"):
      output_file = arg
  print('Exporting Specctra DSN for ', board_file, ' at ', output_file)
  board = pcbnew.LoadBoard(board_file)
  if not pcbnew.ExportSpecctraDSN(board, output_file):
    raise RuntimeError('Could not export Specctra DSN: ' + output_file)

  # KiCad expands circular NPTH keepouts by the board hole clearance.
  # Freerouting applies its clearance again outside those shapes. Export the
  # actual NPTH pad extent and let the router provide the margin once.
  # Restrict this conversion to auto-generated circles matching NPTH sizes;
  # designs with rule areas require per-area rules instead of this workaround.
  rule_areas = list(board.Zones())
  for fp in board.GetFootprints():
    rule_areas.extend(fp.Zones())
  if any(zone.GetIsRuleArea() for zone in rule_areas):
    raise RuntimeError('NPTH normalization requires a board without rule areas')
  clearance = pcbnew.ToMM(board.GetDesignSettings().m_HoleClearance) * 1000
  diameters = {
    round(pcbnew.ToMM(pad.GetSize().x) * 1000 + 2 * clearance, 3):
      pcbnew.ToMM(pad.GetSize().x) * 1000
    for fp in board.GetFootprints() for pad in fp.Pads()
    if pad.GetAttribute() == pcbnew.PAD_ATTRIB_NPTH
      and pad.GetSize().x == pad.GetSize().y
  }
  with open(output_file) as source:
    dsn = source.read()
  count = 0
  def normalize(match):
    nonlocal count
    diameter = float(match.group(2))
    actual = diameters.get(round(diameter, 3))
    if actual is None:
      return match.group(0)
    count += 1
    return match.group(1) + format(actual, '.10g')
  dsn = re.sub(r'(\(keepout "" \(circle [FB]\.Cu )([0-9.]+)', normalize, dsn)

  # KiCad writes route vertices with less precision than rotated pin positions.
  # Recover the source coordinates on Freerouting's 0.1 um board grid, avoiding
  # sub-micron gaps in its exact center/end-point connectivity model.
  import math
  vertices = {}
  def add_vertex(net, layer, point):
    key = (net, layer)
    vertices.setdefault(key, set()).add((round(point.x / 1000, 1), round(point.y / -1000, 1)))
  for fp in board.GetFootprints():
    for pad in fp.Pads():
      for layer in (pcbnew.F_Cu, pcbnew.B_Cu):
        if pad.IsOnLayer(layer):
          add_vertex(pad.GetNetname(), board.GetLayerName(layer), pad.GetPosition())
  for track in board.GetTracks():
    layers = (pcbnew.F_Cu, pcbnew.B_Cu) if isinstance(track, pcbnew.PCB_VIA) else (track.GetLayer(),)
    for layer in layers:
      for point in (track.GetStart(), track.GetEnd()):
        add_vertex(track.GetNetname(), board.GetLayerName(layer), point)
  snapped = 0
  def restore_precision(match):
    nonlocal snapped
    layer, width, coordinates, net = match.groups()
    values = list(map(float, coordinates.split()))
    points = list(zip(values[::2], values[1::2]))
    candidates = vertices.get((net.strip('"'), layer), ())
    for i, point in enumerate(points):
      if candidates:
        nearest = min(candidates, key=lambda candidate: math.dist(point, candidate))
        if math.dist(point, nearest) <= 1.0:
          snapped += int(point != nearest)
          points[i] = nearest
    text = ' '.join(f'{x:.10g} {y:.10g}' for x, y in points)
    return f'(wire (path {layer} {width} {text})(net {net})'
  dsn = re.sub(r'\(wire\s+\(path\s+([FB]\.Cu)\s+(\S+)\s+([^)]*)\)\s*\(net\s+([^)]*)\)', restore_precision, dsn)
  with open(output_file, 'w') as output:
    output.write(dsn)
  print('Normalized', count, 'circular NPTH keepouts; removed baked-in', clearance / 1000, 'mm margin')
  print('Restored sub-micron precision at', snapped, 'route vertices')

if __name__ == "__main__":
   main(sys.argv[1:])
