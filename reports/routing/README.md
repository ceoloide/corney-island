# Corney Island wireless autorouting investigation

Investigation: 7 October 2026. This is a routing diagnosis, not manufacturing approval.

## Draft PR scope

This draft contains only `kibot/export_dsn.py` and this investigation README.
The results below describe the saved experimental configuration, including
local build, JLCPCB-rule, Docker hotpatch, and footprint changes that are not
included in this PR. The battery-connector and board-configuration changes were
subsequently reverted; the pre-existing `only_required_jumpers: true` setting
was preserved. The MCU footprint changes remain local and uncommitted.

Supporting DSN/SES files, DRC JSON, logs, and footprint patches referenced below
remain local investigation artifacts and are not included in this PR. The build
commands under "Reproduce" require the experimental local build changes; they
do not describe functionality added by this draft alone. The exporter remains a
board-specific workaround and needs broader validation before general use.

The investigated configuration selects reversible **Choc v2** switches, rectangular MCU
jumpers, and `only_required_jumpers: true`. The latter was already a local change
when this task began and was preserved. MX-specific historical filter descriptions
are not evidence that the current board has MX footprints.

## Final build result

The final fresh build used all source/export repairs, PR #953, fanout disabled,
and automatic neckdown disabled. It completed routing, SES import, unfiltered
DRC, and KiBot exports, then exited **2** because routing remains incomplete.

| Check | Result |
| --- | ---: |
| KiCad unrouted missing connections | 110 |
| KiCad unrouted geometry errors | 0 |
| Freerouting imported incomplete connections | 125 |
| Freerouting pre-existing clearance violations | 14 |
| Freerouting remaining connections | 37 |
| KiCad post-import missing connections | 29 |
| KiCad post-import geometry errors | 0 |
| KiCad library-lookup warnings, before and after | 75 |

The run took approximately 8 minutes 44 seconds. It stopped after pass 17 with
repeated normalization oscillation warnings, and skipped optimization because
connections remained. Disabling automatic neckdown avoids the two undersized
tracks from the controlled experiment, but this final run leaves more missing
connections. These experiments do not establish that any single change caused
all differences in routing count.

The authoritative remaining KiCad missing-connection counts by net are:

| Net | Missing connections |
| --- | ---: |
| BAT_P | 2 |
| C0 | 2 |
| C1 | 2 |
| C2 | 2 |
| C3 | 1 |
| C4 | 4 |
| C5 | 3 |
| GND | 6 |
| index_home_B | 1 |
| index_top_B | 1 |
| middle_home_B | 1 |
| outer_home_B | 1 |
| outer_top_B | 1 |
| pinky_home_B | 1 |
| ring_home_B | 1 |

`final/` preserves the exact DSN, SES, boards, design rules, DRC reports, and build
log. The root `pcbs/corney_island_wireless_autorouted.kicad_pcb` is the same final
result. Generated Gerbers remain incomplete and are not ready for fabrication.

## Reproduce

```sh
./build.sh corney_island_wireless
# Stop after generation, JLCPCB setup, and unrouted DRC:
UNROUTED_ONLY=1 PLATES='' ./build.sh corney_island_wireless
# Resume that board without regenerating it:
SKIP_GENERATE=1 PLATES='' ./build.sh corney_island_wireless
```

The build now compiles a separate Freerouting image with PR #953, configures KiCad
rules before DSN export, writes unfiltered pre/post-routing JSON DRC reports, and
returns status 2 if post-routing DRC contains errors or missing connections. A
Freerouting job state of `COMPLETED` does **not** mean every connection was routed.
The historical KiBot filters are still present, so use the unfiltered JSON as the
authoritative check. Gerbers produced during diagnosis can contain missing routes.

The experiments used uncommitted footprint edits inside the
`ergogen/footprints/ceoloide` submodule. The local `ergogen-footprints.patch`
preserves those experimental edits; the battery-connector edit was subsequently
reverted. The routing rules and SES import failure check were committed separately
to main. This draft does not include the footprint edits or build integration.

## KiCad preflight and fabrication assumptions

The unrouted board was opened in KiCad 9's PCB Editor. Checks were run through
KiCad 9.0.7's CLI DRC engine, independently of KiBot's suppression filters. The
host KiCad is 8.0.9; a Docker-hosted KiCad 9 editor was used for the normalized
KiCad 9 files, with software rendering enabled.

Rules target two-layer FR-4, 1 oz copper, routed edges, and green solder mask.
[JLCPCB capabilities](https://jlcpcb.com/capabilities/pcb-capabilities/) were checked
on the investigation date. Black/white mask requires a 0.13 mm mask bridge instead
of the configured green-mask 0.10 mm. The board's actual jumper gaps exceed both.

| Constraint | Fabrication minimum used | Routing/default choice |
| --- | ---: | ---: |
| Trace width | 0.10 mm | 0.15 mm signals; fixed footprint traces 0.20/0.25 mm |
| Copper spacing | 0.10 mm | 0.20 mm default |
| SMD pad-to-pad spacing | 0.15 mm | 0.15 mm custom rule |
| Copper to routed edge | 0.20 mm | 0.20 mm KiCad; router also retains its own edge setting |
| NPTH to copper | 0.20 mm | 0.20 mm |
| PTH to other copper | 0.28 mm | 0.28 mm custom rule |
| Via hole-to-hole | 0.20 mm | 0.20 mm |
| Pad hole-to-hole | 0.45 mm | 0.45 mm custom rule |
| PTH drill / NPTH drill | 0.15 / 0.50 mm | Existing holes retained |
| Via diameter / annular ring | 0.25 / 0.05 mm | 0.56 mm diameter, 0.30 mm drill |
| PTH pad annular ring | 0.18 mm absolute minimum | 0.18 mm custom rule |
| Solder-mask expansion / bridge | 0 / 0.10 mm | 1:1 openings, green-mask bridge |
| Silkscreen clearance / text height / text stroke | 0.15 / 1.0 / 0.15 mm | Same |

Initial unfiltered DRC found **110 missing connections, zero geometry errors, and
75 library-lookup warnings**. The warnings say the generated `ceoloide` footprint
library is not configured; embedded footprint geometry is nevertheless checked.
There were no current `holes_co_located`, `hole_near_hole`, `shorting_items`, or
`solder_mask_bridge` errors to dismiss.

A negative control (`rule-validation/`) deliberately introduced a 0.05 mm track
and a 0.40 mm NPTH. DRC detected both, including the named NPTH rule's 0.50 mm
minimum. This verifies that the configured rules are actually being evaluated.
The control is deliberately invalid and must not be fabricated.

## Confirmed problems and repairs

### Distinct DSN images were being collapsed by Freerouting

[PR #953](https://github.com/freerouting/freerouting/pull/953) preserves exact image
IDs such as `mounting_hole_npth::1`, including different keepouts, and protects
back-side package lookup from suffix fallback. The tested snapshot was built on
5 October 2026, before the PR. Its original JAR was preserved outside the repo.

`freerouting/patches/pr953/` contains the two upstream Java files at commit
`5533ed1a8c2cc2f3bab3b1b6138bf83a9b7b2b5f`, provenance, and a Dockerfile. These are
compiled against the snapshot JAR and replace only the relevant classes in a new
`ceoloide/ergogen-freerouting:k9_snapshot_2.5.0-pr953` image.

### NPTH clearance was represented twice

For example, KiCad exported a 5.0 mm switch hole as a 5.4 mm keepout: a 0.2 mm
margin on each side. Freerouting then applied copper clearance outside that
keepout. The same issue affected mounting holes and switch-pin holes.

The exporter now removes the baked-in margin from anonymous circular keepouts
whose diameters match the board's NPTH pads, leaving the actual pad/hole extent.
Freerouting applies its clearance once. For this board that normalizes **44
library-image circles**, representing many repeated footprint instances.

The helper rejects boards with rule areas: arbitrary keepouts need individual
rules and must not be casually shrunk. It is a workaround for this board's
circular NPTH export, not a universal DSN sanitizer. Post-import KiCad DRC is
required to check the resulting routes against the physical holes.

For a general exporter/importer fix, use one explicit contract:

1. Export the physical NPTH obstacle and assign its copper clearance in the
   router. Preserve an intentionally oversized mechanical pad extent.
2. Export an already expanded NPTH keepout in a dedicated obstacle class with
   zero additional copper clearance. Do not set all keepout/area clearance to
   zero: board rule areas can have their own intended margins.

Either contract needs source identity, shape, layer coverage, and clearance
semantics. Matching anonymous circles by diameter is insufficient for arbitrary
boards; the current helper is limited to this board and rejects rule areas.
Distinct footprint images must also remain distinct, as addressed by PR #953.

For the switch center hole, a via center is approximately 3.075 mm from the
hole center. With a 2.5 mm hole radius and a 0.28 mm via copper radius, the
physical clearance is 0.295 mm. A double-counted 0.20 mm margin would instead
require 3.18 mm center distance, falsely rejecting that placement. Keep the
manufacturing clearance intact and repair the representation.

### Concave JST jumper geometry changes in DSN export

The JST chevron's concave notch is absent in the exported padstack; the outer
pad is a rectangle/convex hull. Freerouting therefore sees it overlap the inner
arrow pad and reports four pin-to-pin violations. Original KiCad copper does not
have those overlaps. The importer also convexifies non-convex pad shapes.

The optional `use_rectangular_jumpers` flag adds eight convex 1.2 x 0.7 mm pads
at the existing jumper centers. Their pitch is 1.016 mm and gap is 0.316 mm.
Socket positions, net polarity, trace anchors, and reversibility are retained.
This option is enabled for the wireless JST connector. The legacy default is
unchanged. The revised board no longer causes the JST overlap warnings.

### Exact contact recognition differs from KiCad copper connectivity

Freerouting's `DrillItem.getNormalContacts()` and `Trace.getNormalContacts()`
check exact equality between a pad/via center and a **trace endpoint**. Copper
intersection elsewhere inside a pad does not satisfy that normal-contact test.
The code explicitly avoids tolerance matching because it can create false cycles
in trace normalization.

Two concrete cases were measured:

- All eight pads on rotated switches S20/S21 had zero normal contacts in the
  imported model, although their KiCad tracks start on their pad centers. DSN
  route-coordinate rounding displaced the endpoints by fractions of a micron.
  In the controlled repair, snapping those eight endpoints to the imported pin
  centers restored a contact on every pad and reduced imported incomplete count
  from **145 to 137**.
- MCU rectangular pads are centered at 4.58/5.48 mm locally, but some generated
  back traces/socket traces still used the chevron coordinates 4.775/5.5 mm.
  The copper connects in KiCad, while the center is not a trace endpoint in the
  router. Some back traces also pass through a pad center in the middle of a
  segment. Splitting at those centers restored normal contacts in the experiment.

The MCU generator now uses rectangular pad centers for those trace endpoints.
When a same-net, same-layer trace passes through a pad, splitting it at the
center or adding a real short branch ending at the center can satisfy this
contact model. Prefer correcting an existing endpoint when possible. Avoid
zero-length stubs and preserve separation between open jumper nets. The pad
and trace should share coordinates in the generator, and contact must be
verified after DSN import because rounding and normalization can undo it.
The DSN exporter recovers source routing coordinates on the router's 0.1 um
internal grid instead of retaining coarser rounded vertices. With those source
changes, the imported incomplete count fell from **145 to 125**. These model
repairs did not, by themselves, finish the board.

`InspectDsn.java`, `import-inspection.log`, and `contact-experiment/` retain the
controlled measurements and inputs. Freerouting and KiCad connection counts use
different connectivity representations and should not be compared as identical
units.

### Switch via margin and global clearance

The footprint used 0.60 mm vias spaced 0.80 mm apart: exactly 0.20 mm copper
spacing. Rotated coordinate rounding and the rule file's 0.2001 mm requirement
made this marginal. Switch vias now use the existing board choice of 0.56 mm
with 0.30 mm drill, giving nominal 0.24 mm spacing. The rule now says 0.2000 mm.

### Additional router failures remain

Freerouting still reports clearance violations near rotated thumb footprints
that KiCad does not reproduce. Circular/rotated shape approximation is a likely
remaining contributor, not yet an independently repaired cause. For the center
hole, the physical via-to-hole margin is about 0.295 mm after the via-size change,
above the 0.20 mm requirement.

Logs repeatedly show `BasicBoard.normalizeTraces: reached 2000 iterations` and
split/combine oscillation on C4/C5 and thumb switch nets. Later passes repeat
identical or alternating board scores rather than make sustained progress.
These engine warnings persist after PR #953 and contact/export repairs.

The controlled contact-routing experiment also produced two 0.075 mm tracks
on R1, below the 0.10 mm fabrication minimum. Automatic neckdown is disabled in
the final build command. This experiment is not a manufacturing candidate.

## Historical overlapping holes and jumper DRC policy

For other footprint variants, duplicated coincident NPTH pads should be emitted
once. Truly intersecting holes require an intentional merged mechanical cutout
or narrowly documented exclusions and fabrication review; deleting a required
hole or changing its dimensions just to silence DRC is inappropriate.

Open solder jumpers should have separated copper. Use convex pads and valid
spacing, as above. A KiCad net-tie group is appropriate for an intentional copper
short on the **bare board**, not to excuse any short that could theoretically be
soldered later. Do not mark the entire MCU/JST footprint as one net tie.

KiCad's [net-tie documentation](https://docs.kicad.org/9.0/en/pcbnew/pcbnew.html#creating-net-ties)
explains the supported grouping mechanism. Broadly ignoring all shorts, all
hole-clearance issues, or all mask bridges would hide unrelated manufacturing
and electrical errors.

## Remaining investigation

A useful upstream reproducer should retain one rotated Choc footprint and its
fixed stitching, plus one rectangular MCU jumper row. Check contact preservation
through import, trace splitting/merging, and SES export; then compare circular
obstacles and rotated pin shapes against KiCad. The saved full board can be
reduced to those cases. Increasing pass count alone has not resolved the observed
plateau. More footprint changes should follow such a reproducer, not speculative
removal of holes or net separation.
