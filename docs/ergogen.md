# Generating Corney Island with Ergogen

The design source is [`ergogen/config.yaml`](../ergogen/config.yaml). Generated KiCad files, outlines, and case files are checked in so the design can be inspected without installing the generator.

## Edit in the browser

[![Edit on Ergogen](images/edit-on-ergogen.svg)](https://ergogen.xyz?github=ceoloide/corney-island)

This link loads `ceoloide/corney-island` from GitHub into the Ergogen GUI. It opens the published repository version; local changes in your checkout are not included. The GUI’s repository loader supports `ergogen/config.yaml`, local footprint files, and footprint submodules.

Use the editor to change the configuration and inspect generated geometry. Browser generation and the local routing/fabrication pipeline are separate steps.

## How the source is organized

| YAML section | What it defines |
| --- | --- |
| `meta` | Board name, revision, switch footprint, and active switch preset |
| `presets` | MX, Choc v1, and Choc v2 dimensions and component offsets |
| `units` | Shared dimensions, trace widths, mounting hardware, and case parameters |
| `points` | Finger matrix, thumb cluster, and reference positions for other components |
| `outlines` | PCB perimeter, switch cutouts, plates, mounting holes, and case profiles |
| `pcbs` | Footprints, pin assignments, and shared/wired/wireless board definitions |
| `cases` | Extrusions and cutouts for the bottom tray |

The shared `_corney_island_baseline` supplies the keyboard footprints and controller pin assignments. Both output boards reuse its outlines and footprints through YAML anchors; the wired board adds TRRS, OLED, reset, and RGB footprints, while wireless adds nice!view, power/reset switches, and a battery connector.

The footprint library lives in the [`ceoloide` submodule](../.gitmodules). Two additional local footprint scripts are in [`ergogen/footprints/`](../ergogen/footprints/).

## Local setup

Use **Node.js 24 or newer**, npm, and Git. The build uses the Ergogen fork declared in [`package.json`](../package.json); `package-lock.json` records the resolved dependency versions.

```sh
git clone --recurse-submodules https://github.com/ceoloide/corney-island.git
cd corney-island
npm ci --ignore-scripts
git submodule update --init --recursive
```

For an existing clone, run the last two commands from its root. `--ignore-scripts` avoids this repository’s postinstall hook, which updates the footprint submodule with `--remote`. The explicit submodule command above uses the revision recorded in the checkout.

## Generate geometry and PCBs

From the repository root:

```sh
npm run build
```

This runs Ergogen on the `ergogen/` directory and converts the generated bottom tray from JSCAD to STL.

| Output | Location |
| --- | --- |
| Keyboard and plate KiCad PCBs | `pcbs/` |
| SVG and DXF outlines | `outlines/` |
| JSCAD and STL bottom tray | `cases/` |

For extra debug outputs, use `npm run debug`. To regenerate when YAML or JavaScript changes, use `npm run watch:build` or `npm run watch:debug`.

**Generation replaces output files.** Save or commit manual edits before running these commands. Make persistent layout and footprint changes in the YAML or footprint source, then regenerate.

## Change the design

The current source selects `presets.choc_v2` through `meta.switch` and the `ceoloide/switch_choc_v1_v2` footprint through `meta.footprint`. Choc v2 support is enabled and Choc v1 support disabled in both active switch-footprint blocks.

Changing switch family requires coordinating the preset, footprint, footprint parameters, plate cutouts, and component clearances. Selecting MX also requires replacing Choc-specific parameters with parameters supported by the MX footprint.

Spacing comes from `ks` and `kp`; column stagger and thumb positioning are defined in `points`. Case dimensions are in `units` and its construction is in `cases`. Changes to spacing, stagger, thumb positions, mounting holes, or outlines require rechecking crkbd v3 plate and case compatibility.

## Routing and fabrication

The geometry build does not complete the PCB routing or validate manufacturing files. The full pipeline requires **Docker** in addition to the local Node dependencies:

```sh
docker pull ceoloide/ergogen-freerouting:dev
./build.sh
```

To process one keyboard variant:

```sh
./build.sh corney_island
# Or:
./build.sh corney_island_wireless
```

The script regenerates the design, processes the shared plates, applies board rules, exports DSN files, runs Freerouting, imports the routes, and checks connectivity and KiCad DRC. KiBot creates previews and fabrication outputs. The routing image, timeout, and neckdown settings are documented in [DSN export and build integration](../kibot/DSN_EXPORT.md#build-integration).

`build.sh` clears `outlines/`, `pcbs/`, `points/`, `source/`, and `cases/` before regeneration. It preserves existing custom `.kicad_dru` rules and files matching `pcbs/*_manually_routed*`; other manual edits in those output directories are not preserved.

Generated source boards use names such as `corney_island.kicad_pcb`; imported routing results use `corney_island_autorouted.kicad_pcb`. Source-board Gerbers can be exported before routing. Autorouted fabrication exports require the post-route check to pass; diagnostic previews may exist even when it fails.

The batch continues after individual board failures and can exit with status zero while printing `Boards requiring attention`.

**Inspect the reports and final board before ordering.**

## Repository map

| Path | Purpose |
| --- | --- |
| [`ergogen/`](../ergogen/) | Parametric source and footprint scripts |
| [`pcbs/`](../pcbs/) | KiCad boards, projects, and custom rules |
| [`outlines/`](../outlines/) | Generated SVG/DXF geometry |
| [`cases/`](../cases/) | Generated tray source and STL |
| [`docs/`](../docs/) | Generation guide, build guide, images |
| [`gerbers/`](../gerbers/) | Fabrication archives; check their routing/DRC status |
| [`kibot/`](../kibot/) | KiCad export/import, validation, and KiBot configuration |
| [`freerouting/`](../freerouting/) | Autorouter rules and logging configuration |
| [`reports/routing/`](../reports/routing/) | Saved machine-readable validation and investigation results |
| [`.github/workflows/`](../.github/workflows/) | Generation, routing, and artifact workflow |
