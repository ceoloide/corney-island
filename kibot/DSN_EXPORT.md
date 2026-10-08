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

The exporter preserves KiCad's native NPTH obstacle extents. It restores source
coordinate precision without removing the clearance already included in those
obstacles. The experimental `normalize_npth` utility remains in
`dsn_precision.py` with unit coverage, but is not invoked by the exporter.
There is no `--keep-native-npth` switch: preservation is the default behavior.

Freerouting's circular obstacle approximation and coordinate rounding remain
separate issues. Check imported routes with unfiltered KiCad DRC; precision
repair alone does not establish complete or correct autorouting.

## Build integration

`build.sh` applies the two-layer JLCPCB profile with `configure_jlcpcb.py`
before export and writes unfiltered pre-route and post-route DRC reports to
`reports/routing/`. Existing `.kicad_dru` files survive generation and are left
unchanged; the helper creates custom rules only if that file is absent.

`routing_status.py` rejects missing connections or DRC errors for the specific
board. Failed boards skip final fabrication exports, and the batch continues
with subsequent boards and prints a failure summary. Board-level failures do
not set a nonzero batch exit status; generation failures still do.

## Validation

```sh
python3 -m unittest discover -s kibot/tests -v
```

Thirteen tests cover coordinate restoration, ambiguous matches, descriptor
preservation, shared-image splitting, NPTH identity and layer matching,
oversized extents, implicit circle origins, rule-area rejection, and idempotence.
Integration checks on both saved keyboard boards and a ten-angle fixture verify
source-PCB preservation, unchanged rules/resolution/nets, and idempotence of the
precision repair. The batch regression checks that DRC and routing failures
do not prevent later boards from building and that custom rules are retained.
Freerouting import testing does not establish complete autorouting or replace
post-routing KiCad DRC.
