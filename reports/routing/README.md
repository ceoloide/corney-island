# Regenerated boards: NPTH normalization and current Freerouting

> Historical results from the board-regeneration commit `d35bc08`, using the
> local Freerouting build at `1be66ad`. The local JAR pin and verifier described
> below have since been replaced by the published toolchain image
> `ceoloide/ergogen-freerouting:k9_snapshot_20261020_121300`.
> See [current build instructions](../../kibot/DSN_EXPORT.md#build-integration).
> A smoke test of that image reproduced the same single wireless C4 open with
> zero KiCad DRC errors. The board results and hashes below remain historical.

The NPTH workaround is enabled by default again. Both keyboard boards and all
three plates were regenerated from the current YAML. The saved wireless board
now contains the eight rectangular JST SMD jumper pads configured in that YAML.
The routed boards remain incomplete and are retained for review. Their routed
Gerber archives and images are withheld; the frontplate exports are withheld
because its outline fails DRC.

## Toolchain and settings

- KiCad **9.0.7+1**, using `ghcr.io/inti-cmnb/kicad9_auto:latest`.
- Freerouting **2.5.1-SNAPSHOT**, built from upstream `master` head
  [`1be66ad2797395f3a258a7f3b9b31c724a624867`](https://github.com/freerouting/freerouting/commit/1be66ad2797395f3a258a7f3b9b31c724a624867), fetched and checked for this regeneration.
- Java **25.0.4.1+1**, using `eclipse-temurin:25-jre`.
- Node **24.22.0**, installed Ergogen **4.2.1**, and the checked-out footprint submodule.
- Default build: automatic neckdown enabled, 100 µm neck-width floor, fanout
  disabled, one optimizer worker, 25 autorouter passes, 20-minute job limit.

`freerouting/build.json` pins the version and revision. Local builds reject a
mismatched JAR before replacing generated files. CI builds that pinned source
revision and runs the same build script. CI itself has not been run remotely
for this commit. Image digests, JAR hash, PCB hashes, and machine-readable
results are recorded in [regeneration.json](regeneration.json).

## Primary results

| Board | Missing connections | KiCad DRC errors | Result |
| --- | ---: | ---: | --- |
| Wireless, autorouted | 1, C4 | 0 | Incomplete |
| Wired, autorouted | 2, both VCC | 16, all pre-existing | Incomplete |
| Backplate | 0 | 0 | Passed |
| Controller overlay | 0 | 0 | Passed |
| Frontplate | 0 | 1, pre-existing outline error | Failed |

The wired run reached its **25-pass limit**, finishing normally after about
18 minutes 31 seconds. It did **not** time out. A slow routing pass took
554 seconds; a thread sample placed the worker in recursive cycle detection
under `BasicBoard.normalizeTraces`, called by `FoundConnectionInserter`.
Optimization was skipped on both boards because connections remained open.
Peak routing heap was 344.1 MB for wired and 292.9 MB for wireless.

No new KiCad DRC errors were introduced by routing. Comparing the complete
pre-route and post-route error sets gives identical errors for each keyboard.
The remaining C4 connection is still present in a separate wireless run with
both narrowing paths disabled; that run also has zero KiCad DRC errors.

A separate wired diagnostic with both narrowing paths disabled and optimization
disabled reached its **8-minute timeout** with **14 missing connections** and
the same **16 source DRC errors**, plus seven dangling-track warnings. Its
shorter budget prevents a matched
completion comparison with the 20-minute default run. The imported diagnostic
DRC report is [corney_island-no-neckdown.json](corney_island-no-neckdown.json).
This diagnostic result does not replace the primary routed PCB.

## Source findings confirmed against the previous boards

The wired board has sixteen `copper_edge_clearance` errors involving the pads
of LED20 and LED21 and their footprint cutouts. KiCad reports **0.199999 mm**
against a **0.200000 mm** requirement. These are present before routing.

The frontplate has an `invalid_outline` error for an almost-zero arc, reported
as 222 nm. Checking the previous committed PCB files with the same KiCad image
and JLCPCB settings reproduced both findings: sixteen wired errors and one
frontplate error. These are source-board findings, independent of Freerouting
and the NPTH export change. The before-regeneration JSON reports are included
alongside the new reports.

Other DRC findings in the primary runs are warnings about the unconfigured `ceoloide` footprint
library. The reports retain those warnings without suppressing them.

## NPTH and fabrication-floor validation

Actual KiCad 9 exports normalized **44** NPTH obstacles on wireless and **40**
on wired. Comparing default exports with `--keep-native-npth` showed that only
matched NPTH diameters differed. Both precision restoration and NPTH
normalization were idempotent, and export left the source PCB bytes unchanged.
Named and unmatched keepouts remained unchanged.

The minimum track width in the imported routed boards is **100 µm** on wired
and **150 µm** on wireless. No track is below the configured 100 µm floor.

Seventeen regression tests pass, including the default NPTH repair, native
opt-out, atomic failure, stale-JAR rejection, failed plate/board continuation,
custom-rule preservation, and stale-export cleanup. ShellCheck, shell syntax,
workflow YAML validation, and `git diff --check` also pass.

The `.kicad_pro` files are generated by `configure_jlcpcb.py` and remain ignored
by Git. The generated `.kicad_dru` files are included with the PCB files.
Unrouted-board exports retain the repository's existing naming convention;
the validation failures above also apply when reviewing those files.
