#!/bin/sh
container_cmd=docker
# Ensure we switch to the /board working directory, pointing it
# at the repo root (when running the script from there)
container_args="-w /board -v $(pwd):/board --rm"

# Define the boards to autoroute and export, and the plates
boards="${*:-corney_island corney_island_wireless}"
kicad_auto_image="ceoloide/ergogen-freerouting:k9_snapshot_20261020_121300"
freerouting_cli_image="ceoloide/ergogen-freerouting:k9_snapshot_20261020_121300"

# Cleanup Freerouting log outputs and json
rm -f freerouting/freerouting.log
rm -f freerouting/freerouting.json
rm -f logs/freerouting.log

for board in ${boards}
do
    echo "\n\n>>>>>> Processing $board <<<<<<\n\n"

    # Cleanup the outputs
    rm -f pcbs/${board}.dsn  
    rm -f pcbs/${board}.ses  
    rm -f pcbs/${board}.pro  
    rm -f pcbs/${board}_autorouted.kicad_pcb  
 
    if [ -e pcbs/${board}.kicad_pcb ]; then
        echo Export DSN 
        ${container_cmd} run ${container_args} ${kicad_auto_image} kibot/export_dsn.py -b pcbs/${board}.kicad_pcb -o pcbs/${board}.dsn
        ${container_cmd} run ${container_args} ${kicad_auto_image} kibot -b pcbs/${board}.kicad_pcb -c kibot/default.kibot.yaml
    fi
    if [ -e pcbs/${board}.dsn ]; then
        echo Autoroute PCB
        sed "s/(rules PCB corney_island/(rules PCB ${board}/" freerouting/freerouting.rules > freerouting/${board}.rules
        ${container_cmd} run ${container_args} ${freerouting_cli_image} java -Dlog4j.configurationFile=freerouting/log4j2.xml -jar /opt/freerouting.jar -de pcbs/${board}.dsn -do pcbs/${board}.ses  -dr ./freerouting/${board}.rules --user_data_path=./freerouting --router.autorouter.max_passes=25 --router.fanout.enabled=false --router.max_threads=1 --router.optimizer.max_threads=1 --router.job_timeout=00:20:00 --router.automatic_neckdown=true --router.neck_width_um=100 -dct 0 --gui.enabled=false --profile.email=marco.massarelli@gmail.com
        rm -f freerouting/${board}.rules
    fi
    if [ -e pcbs/${board}.ses ]; then
        echo "Import SES"
        ${container_cmd} run ${container_args} ${kicad_auto_image} kibot/import_ses.py -b pcbs/${board}.kicad_pcb -s pcbs/${board}.ses -o pcbs/${board}_autorouted.kicad_pcb
    fi
    if [ -e pcbs/${board}_autorouted.kicad_pcb ]; then
        ${container_cmd} run ${container_args} ${kicad_auto_image} kibot -b pcbs/${board}_autorouted.kicad_pcb -c kibot/boards.kibot.yaml
    fi
done

# Docker runs as root and causes issues with file ownership
sudo chown $USER -R ergogen freerouting pcbs gerbers images 2>/dev/null || true
