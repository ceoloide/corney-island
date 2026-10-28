#!/bin/sh
# A failed board is reported and skipped; remaining boards still build.
container_cmd=docker
boards="${*:-corney_island_wireless corney_island}"
plates="backplate frontplate controller_overlay"
# Development toolchain shared with CI; override to test a specific image.
kicad_auto_image="${ERGOGEN_DOCKER_IMAGE:-ceoloide/ergogen-freerouting:dev}"
freerouting_cli_image="$kicad_auto_image"
# JLCPCB two-layer, 1 oz FR-4 minimum: 0.10 mm (100 um).
# https://jlcpcb.com/help/article/jlcpcb-copper-weight
# Temporarily disable neckdown and fanout while routing completion is investigated.
# https://static.ceoloide.com/reports/corney-island-seed42-comparison-2026-10-20/index.html
case "${FREEROUTING_NECKDOWN:-false}" in
    true) freerouting_automatic_neckdown=true; freerouting_neck_width_um=100 ;;
    false) freerouting_automatic_neckdown=false; freerouting_neck_width_um=0 ;;
    *) echo "FREEROUTING_NECKDOWN must be true or false." >&2; exit 1 ;;
esac

run_container() {
    # Keep generated boards editable on the host. KiCad/KiBot need a writable home.
    "$container_cmd" run --user "$(id -u):$(id -g)" -e HOME=/tmp \
        -w /board -v "$(pwd):/board" --rm "$@"
}

remove_backups() {
    # KiCad safety copies are not build outputs.
    [ ! -d pcbs ] || find pcbs -maxdepth 1 -type f -name '*-bak' -delete
}

# Only existing custom rules and manually routed files need preservation.
project_backup=$(mktemp -d) || exit 1
restore_files() {
    mkdir -p pcbs || return 1
    for saved in "$project_backup"/*; do
        [ -e "$saved" ] || continue
        cp -a "$saved" pcbs/ || return 1
    done
}
# Invoked through the exit trap below.
# shellcheck disable=SC2317
cleanup() {
    if restore_files; then
        rm -rf "$project_backup"
    else
        echo "Could not restore saved files; backup retained at $project_backup" >&2
    fi
    remove_backups
}
trap 'cleanup' 0
trap 'exit 1' HUP INT TERM
for saved in pcbs/*.kicad_dru pcbs/*_manually_routed*; do
    [ -e "$saved" ] || continue
    cp -a "$saved" "$project_backup/" || exit 1
done

rm -rf outlines pcbs points source cases
rm -f freerouting/freerouting.log freerouting/freerouting.json logs/freerouting.log
npm run debug || exit 1
restore_files || exit 1
# Avoid restoring old files over results during final cleanup.
rm -rf "$project_backup"
project_backup=$(mktemp -d) || exit 1
mkdir -p reports/routing || exit 1

failed_boards=""
for plate in $plates; do
    printf '\n>>>>>> Processing %s <<<<<<\n' "$plate"
    rm -f "gerbers/$plate.zip" "docs/images/$plate-top.png" "docs/images/$plate-bottom.png" \
        "reports/routing/$plate.json"
    (
        set -e
        run_container "$kicad_auto_image" kicad-cli pcb drc --format json --severity-all \
            -o "reports/routing/$plate.json" "pcbs/$plate.kicad_pcb"
        run_container "$kicad_auto_image" python3 kibot/routing_status.py "reports/routing/$plate.json"
        run_container "$kicad_auto_image" kibot -b "pcbs/$plate.kicad_pcb" -c kibot/default.kibot.yaml
    )
    plate_status=$?
    remove_backups
    if [ "$plate_status" -ne 0 ]; then
        echo "FAILED: $plate; continuing with the next board." >&2
        failed_boards="$failed_boards $plate"
    fi
done

build_board() {
    board=$1
    # Never leave an earlier fabrication archive or report beside a failed run.
    rm -f "gerbers/${board}_autorouted.zip" \
        "docs/images/${board}_autorouted-top.png" "docs/images/${board}_autorouted-bottom.png" \
        "reports/routing/$board-autorouted.json"
    printf '\n>>>>>> Processing %s <<<<<<\n' "$board"
    if [ -e "pcbs/${board}_manually_routed.kicad_pcb" ]; then
        run_container "$kicad_auto_image" kibot -b "pcbs/${board}_manually_routed.kicad_pcb" -c kibot/boards.kibot.yaml
    fi
    if [ ! -e "pcbs/$board.kicad_pcb" ]; then
        echo "Missing board: $board" >&2
        return 1
    fi
    run_container "$kicad_auto_image" python3 kibot/configure_jlcpcb.py "pcbs/$board.kicad_pcb"
    # Unrouted connections are expected; retain the full pre-route report.
    run_container "$kicad_auto_image" kicad-cli pcb drc --format json --severity-all -o "reports/routing/$board-unrouted.json" "pcbs/$board.kicad_pcb"
    run_container "$kicad_auto_image" kibot/export_dsn.py -b "pcbs/$board.kicad_pcb" -o "pcbs/$board.dsn"
    run_container "$kicad_auto_image" kibot -b "pcbs/$board.kicad_pcb" -c kibot/default.kibot.yaml

    # A failed run must not reuse an earlier routing result.
    rm -f "pcbs/$board.ses" "pcbs/${board}_autorouted.kicad_pcb"
    sed "s/(rules PCB corney_island/(rules PCB $board/" freerouting/freerouting.rules > "freerouting/$board.rules"
    run_container "$freerouting_cli_image" java \
        -Dlog4j.configurationFile=freerouting/log4j2.xml -jar /opt/freerouting.jar \
        -de "pcbs/$board.dsn" -do "pcbs/$board.ses" -dr "./freerouting/$board.rules" \
        --user_data_path=./freerouting --gui.enabled=false \
        --router.autorouter.max_passes=25 --router.fanout.enabled=false \
        --router.max_threads=1 --router.optimizer.max_threads=1 \
        --router.job_timeout="${FREEROUTING_JOB_TIMEOUT:-00:20:00}" \
        --router.automatic_neckdown="$freerouting_automatic_neckdown" \
        --router.neck_width_um="$freerouting_neck_width_um" \
        -dct 0 --profile.email=marco.massarelli@gmail.com
    run_container "$kicad_auto_image" kibot/import_ses.py -b "pcbs/$board.kicad_pcb" -s "pcbs/$board.ses" -o "pcbs/${board}_autorouted.kicad_pcb"
    cp "pcbs/$board.kicad_pro" "pcbs/${board}_autorouted.kicad_pro"
    cp "pcbs/$board.kicad_dru" "pcbs/${board}_autorouted.kicad_dru"
    run_container "$kicad_auto_image" kicad-cli pcb drc --format json --severity-all -o "reports/routing/$board-autorouted.json" "pcbs/${board}_autorouted.kicad_pcb"
    # Previews help diagnose incomplete routes. Only select image outputs here;
    # fabrication exports remain behind the unfiltered routing/DRC check below.
    run_container "$kicad_auto_image" kibot -b "pcbs/${board}_autorouted.kicad_pcb" -c kibot/default.kibot.yaml top_view bottom_view
    run_container "$kicad_auto_image" python3 kibot/routing_status.py "reports/routing/$board-autorouted.json"
    # Old root-owned reports cannot be overwritten by the invoking user's KiCad CLI.
    rm -f "kibot/drc/${board}_autorouted-drc."*
    run_container "$kicad_auto_image" kibot -b "pcbs/${board}_autorouted.kicad_pcb" -c kibot/boards.kibot.yaml
}

for board in $boards; do
    # Fail fast for one board without stopping the outer loop.
    (set -e; build_board "$board")
    board_status=$?
    remove_backups
    rm -f "freerouting/$board.rules"
    if [ "$board_status" -ne 0 ]; then
        echo "FAILED: $board (status $board_status); continuing with the next board." >&2
        failed_boards="$failed_boards $board"
    fi
done
if [ -n "$failed_boards" ]; then
    echo "Boards requiring attention:$failed_boards" >&2
fi
# Validation failures are reported, not a failure of the whole batch.
exit 0
