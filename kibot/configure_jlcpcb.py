#!/usr/bin/env python3
"""Apply JLCPCB two-layer, 1 oz, green-mask limits before DSN export.
Source: https://jlcpcb.com/capabilities/pcb-capabilities/ (2026-10-07).
Routing defaults retain margin above fabrication minima. No DRC is suppressed.
Existing .kicad_dru files are preserved; custom rules are created only if absent.
"""
import pcbnew
import json
import sys
from pathlib import Path

board = Path(sys.argv[1])
project = board.with_suffix(".kicad_pro")
data = json.loads(project.read_text()) if project.exists() else {}
settings = data.setdefault("board", {}).setdefault("design_settings", {})
settings.setdefault("meta", {})["version"] = 2
settings.setdefault("rules", {}).update({
    "min_clearance": 0.1, "min_track_width": 0.1,
    "min_copper_edge_clearance": 0.2, "min_hole_clearance": 0.2,
    "min_hole_to_hole": 0.2, "min_through_hole_diameter": 0.15,
    "min_via_diameter": 0.25, "min_via_annular_width": 0.05,
    "min_silk_clearance": 0.15, "min_text_height": 1.0,
    "min_text_thickness": 0.15, "solder_mask_to_copper_clearance": 0.09,
})
net_settings = data.setdefault("net_settings", {})
net_settings.setdefault("meta", {})["version"] = 4
classes = net_settings.setdefault("classes", [{"name": "Default"}])
for cls in classes:
    if cls["name"] == "Default":
        cls.update(clearance=0.2, track_width=0.15, via_diameter=0.56, via_drill=0.3)
project.write_text(json.dumps(data, indent=2) + "\n")
custom_rules = """(version 1)
(rule "JLCPCB SMD pad spacing"
 (condition "A.Type == 'Pad' && B.Type == 'Pad' && A.Pad_Type == 'SMD' && B.Pad_Type == 'SMD'")
 (constraint clearance (min 0.15mm)))
(rule "JLCPCB PTH to copper"
 (condition "A.Type == 'Pad' && A.Pad_Type == 'Through-hole'")
 (constraint hole_clearance (min 0.28mm)))
(rule "JLCPCB PTH annular ring"
 (condition "A.Type == 'Pad' && A.Pad_Type == 'Through-hole'")
 (constraint annular_width (min 0.18mm)))
(rule "JLCPCB pad hole spacing"
 (condition "A.Type == 'Pad' && B.Type == 'Pad'")
 (constraint hole_to_hole (min 0.45mm)))
(rule "JLCPCB NPTH minimum drill"
 (condition "A.Type == 'Pad' && A.Pad_Type == 'NPTH, mechanical'")
 (constraint hole_size (min 0.5mm)))
"""
rules = board.with_suffix(".kicad_dru")
if rules.exists():
    print(f"Preserved existing custom rules: {rules}")
else:
    rules.write_text(custom_rules)
print(f"Applied JLCPCB project settings to {project}")

# These settings live in the PCB rather than the project JSON.
pcb = pcbnew.LoadBoard(str(board))
design = pcb.GetDesignSettings()
design.m_SolderMaskExpansion = pcbnew.FromMM(0)
design.m_SolderMaskMinWidth = pcbnew.FromMM(0.1)
pcbnew.SaveBoard(str(board), pcb)
