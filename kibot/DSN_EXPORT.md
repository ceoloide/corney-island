# KiCad DSN export repair

`export_dsn.py` repairs KiCad's native DSN using the source PCB. Run it in
KiCad's Python environment; the source board is never saved or modified.

```sh
python3 kibot/export_dsn.py -b board.kicad_pcb -o board.dsn
```

From the repository root with KiCad 9 Docker:

```sh
docker run --rm -v "$PWD:/board" -w /board --entrypoint python3 \
  ghcr.io/inti-cmnb/kicad9_auto:latest kibot/export_dsn.py \
  -b pcbs/corney_island_wireless.kicad_pcb -o /board/wireless.dsn
```

## Precision

KiCad serializes some coordinates with six significant digits, losing source
precision on large or rotated boards. The repair restores wire vertices, via
centers, polygonized board boundaries, footprint placements, local pin positions,
and identified circular NPTH centers. Source matching uses KiCad's native
rounding and source identity/net/layer where applicable. Ambiguous matches fail
instead of selecting a nearby point. Shared library images are split when
different source geometry has identical rounded serialization.

The repair preserves widths, rules, nets, layers, rotations, and declared DSN
resolution. It does not snap contacts to Freerouting's internal grid. Native
padstack shapes and arbitrary custom-pad geometry retain their exported values.
Arc tracks are unsupported; export fails rather than attempting to match them.
The implementation currently requires micrometer DSN exports and was tested
with KiCad 9.0.7. Output replacement is atomic, preserving existing output on
failure.

## NPTH clearance

This integrates the correction from
[PR #23](https://github.com/ceoloide/corney-island/pull/23): KiCad expands circular
NPTH keepouts by its hole clearance, and Freerouting adds clearance outside that
shape again. A 5.0 mm hole with 0.2 mm clearance becomes a 5.4 mm native obstacle.
The repair restores its physical extent so Freerouting applies its clearance
once. An oversized mechanical pad extent is preserved.

Unlike the original diameter-only matching, normalization requires an anonymous
library circle matching a source NPTH's footprint, local center, expanded
diameter, and copper layer. Only circular pads with round drills that KiCad
exports as circular obstacles are covered. Other keepouts are retained.
Boards containing board or footprint rule areas are rejected by default.
Use `--keep-native-npth` for precision repair without NPTH normalization.

The router's obstacle clearance must cover the intended hole clearance; this
script does not translate arbitrary KiCad custom rules into Freerouting rules.
Check the imported routes with KiCad DRC. Circular obstacle approximation and
Freerouting's own coordinate rounding remain separate issues.

## Validation

```sh
python3 -m unittest discover -s kibot/tests -v
```

Twelve tests cover coordinate restoration, ambiguous matches, descriptor
preservation, shared-image splitting, NPTH identity and layer matching,
oversized extents, implicit circle origins, rule-area rejection, and idempotence.
Integration checks on both saved keyboard boards and a ten-angle fixture verify
source-PCB preservation, unchanged rules/resolution/nets, and idempotence of the
combined repair. The saved wireless board normalizes 44 library circles.
Freerouting import testing does not establish complete autorouting or replace
post-routing KiCad DRC.
