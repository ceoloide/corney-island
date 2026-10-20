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

The exporter normalizes source-proven circular NPTH obstacles by default. KiCad
adds its hole-clearance margin to the exported diameter; Freerouting then applies
its obstacle clearance again. Normalization restores the larger of the source
pad and drill diameters, avoiding that duplicated margin. Footprint identity,
center, layer, and expanded diameter must all match. Named or unmatched keepouts
are preserved. This changes the DSN only, not the source PCB.

Use `--keep-native-npth` to retain KiCad's expanded obstacles for comparison.
Boards containing rule areas are rejected unless that option is supplied,
because the exporter cannot safely distinguish all such obstacles.

Freerouting's circular obstacle approximation and coordinate rounding remain
separate issues. Check imported routes with unfiltered KiCad DRC; precision
repair alone does not establish complete or correct autorouting.

## Build integration

The build and CI use the published toolchain image
`ceoloide/ergogen-freerouting:k9_snapshot_20261020_121300` directly. It bundles
KiCad 9, Java 25, and **Freerouting 2.5.1-SNAPSHOT** from the fixed
`20261020_121300` snapshot (upstream revision `c4755a88`). Freerouting runs from
`/opt/freerouting.jar` inside the image. No local JAR, source checkout, snapshot
discovery, or runtime revision verifier is needed.

```sh
docker pull ceoloide/ergogen-freerouting:k9_snapshot_20261020_121300
./build.sh
```

This is a temporary image pin while the upstream fixes are developed. Update
the image tag explicitly when adopting another build. The image is maintained
in the sibling `ergogen-docker` repository; it includes the neck-width-floor fix
from [Freerouting PR #979](https://github.com/freerouting/freerouting/pull/979).

For two-layer, 1 oz FR-4, [JLCPCB lists a 0.10 mm minimum trace width and spacing](https://jlcpcb.com/help/article/jlcpcb-copper-weight)
(checked 2026-10-19). The default build explicitly passes
`--router.automatic_neckdown=true --router.neck_width_um=100`, matching the
project's 0.10 mm fabrication minimum. The latter also enables whole-connection
retries at 100 µm, so the resulting power routes still need review against their
nominal widths and current requirements. For a comparison with both narrowing
paths disabled:

```sh
FREEROUTING_NECKDOWN=false ./build.sh corney_island
```

This passes `--router.automatic_neckdown=false --router.neck_width_um=0`.
The precision exporter and post-route KiCad checks apply in both modes. Fanout
is explicitly disabled, matching the rules file, and the optimizer uses one
worker. Each routing job has a 20-minute limit; override it with
`FREEROUTING_JOB_TIMEOUT=HH:MM:SS`. A timeout can retain a routing result, so the
post-import connectivity and DRC checks still determine whether fabrication
outputs are produced.

CI invokes the same `build.sh` and pulls the same toolchain image, retaining
unfiltered DRC reports with its artifacts.

`build.sh` applies the two-layer JLCPCB profile with `configure_jlcpcb.py`
before export and writes unfiltered pre-route and post-route DRC reports to
`reports/routing/`. Existing `.kicad_dru` files survive generation and are left
unchanged; the helper creates custom rules only if that file is absent.

`routing_status.py` rejects missing connections or DRC errors for the specific
board. Plates also run unfiltered DRC before export. Failed boards skip final
fabrication exports, and the batch continues
with subsequent boards and prints a failure summary. Board-level failures do
not set a nonzero batch exit status; generation failures still do.

## Validation

```sh
python3 -m unittest discover -s kibot/tests -v
```

Sixteen tests cover coordinate restoration, ambiguous matches, descriptor
preservation, shared-image splitting, NPTH identity and layer matching,
oversized extents, implicit circle origins, rule-area rejection, and idempotence. Entry-point tests cover default NPTH normalization, the native
opt-out, atomic failure, and readable exports.
Integration checks on both saved keyboard boards and a ten-angle fixture verify
source-PCB preservation, unchanged rules/resolution/nets, and idempotence of the
precision repair. The batch regression checks that plate DRC, board DRC, and routing failures
do not prevent later boards from building and that custom rules are retained. Stale routed fabrication archives and images
are removed before a new routing attempt, so failures cannot reuse them. Plate
archives and images are also removed before plate validation.
Freerouting import testing does not establish complete autorouting or replace
post-routing KiCad DRC.
