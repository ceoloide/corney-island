#!/bin/sh
# A failed board is reported and skipped; remaining boards still build.
container_cmd=docker
boards="${*:-corney_island_wireless corney_island}"
plates="backplate frontplate controller_overlay"
kicad_auto_image="ghcr.io/inti-cmnb/kicad9_auto:latest"
freerouting_cli_image="ceoloide/ergogen-freerouting:k9_snapshot_2.5.0"

run_container() {
    "$container_cmd" run -w /board -v "$(pwd):/board" --rm "$@"
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
cleanup() {
    if restore_files; then
        rm -rf "$project_backup"
    else
        echo "Could not restore saved files; backup retained at $project_backup" >&2
    fi
    for directory in ergogen freerouting pcbs gerbers images reports; do
        [ -d "$directory" ] || continue
        run_container --entrypoint chown "$kicad_auto_image" -R "$(id -u):$(id -g)" "$directory" || true
    done
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

for plate in $plates; do
    printf '\n>>>>>> Processing %s <<<<<<\n' "$plate"
    run_container "$kicad_auto_image" kibot -b "pcbs/$plate.kicad_pcb" -c kibot/default.kibot.yaml || echo "FAILED: $plate" >&2
done

build_board() {
    board=$1
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
    run_container "$freerouting_cli_image" java -Dlog4j.configurationFile=freerouting/log4j2.xml -jar /opt/freerouting.jar -de "pcbs/$board.dsn" -do "pcbs/$board.ses" -dr "./freerouting/$board.rules" --user_data_path=./freerouting --router.autorouter.max_passes=25 -mt 1 -dct 0 --gui.enabled=false --profile.email=marco.massarelli@gmail.com
    run_container "$kicad_auto_image" kibot/import_ses.py -b "pcbs/$board.kicad_pcb" -s "pcbs/$board.ses" -o "pcbs/${board}_autorouted.kicad_pcb"
    cp "pcbs/$board.kicad_pro" "pcbs/${board}_autorouted.kicad_pro"
    cp "pcbs/$board.kicad_dru" "pcbs/${board}_autorouted.kicad_dru"
    run_container "$kicad_auto_image" kicad-cli pcb drc --format json --severity-all -o "reports/routing/$board-autorouted.json" "pcbs/${board}_autorouted.kicad_pcb"
    run_container "$kicad_auto_image" python3 kibot/routing_status.py "reports/routing/$board-autorouted.json"
    run_container "$kicad_auto_image" kibot -b "pcbs/${board}_autorouted.kicad_pcb" -c kibot/boards.kibot.yaml
}

failed_boards=""
for board in $boards; do
    # Fail fast for one board without stopping the outer loop.
    (set -e; build_board "$board")
    board_status=$?
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
