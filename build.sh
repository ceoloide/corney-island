#!/bin/sh
container_cmd=docker
# Ensure we switch to the /board working directory, pointing it
# at the repo root (when running the script from there)
container_args="-w /board -v $(pwd):/board --rm"

# Cleanup the output folder or KiCad will error out
rm -rf ergogen/output

# Generate unrouted PCBs with Ergogen (definition in package.json)
npm run debug

# Define the boards to autoroute and export, and the plates
boards="corney_island"
plates="backplate frontplate controller_overlay"

# Define the fabrication profile and additional flags
fab=jlcpcb
flags=--no-assembly

# Define the pcbdraw style
pcbdraw_style=set-black-hasl

if [ ! -e freerouting/freerouting-1.8.0.jar ]; then
    curl https://github.com/freerouting/freerouting/releases/download/v1.8.0/freerouting-1.8.0.jar -L -o freerouting/freerouting-1.8.0.jar
fi

for plate in ${plates}
do
    echo "\n\n>>>>>> Processing $plate <<<<<<\n\n"
    ${container_cmd} run ${container_args} ghcr.io/inti-cmnb/kicad7_auto:latest kibot -b ergogen/output/pcbs/${plate}.kicad_pcb -c kibot/boards.kibot.yaml
done

for board in ${boards}
do
    echo "\n\n>>>>>> Processing $board <<<<<<\n\n"
    ${container_cmd} run ${container_args} soundmonster/kicad-automation-scripts:latest /bin/sh -c "mkdir -p $HOME/.config/kicad; cp /root/.config/kicad/* $HOME/.config/kicad"
    if [ -e ergogen/output/pcbs/${board}.kicad_pcb ]; then
        echo Export DSN 
        ${container_cmd} run ${container_args} ghcr.io/inti-cmnb/kicad7_auto:latest kibot/export_dsn.py -b ergogen/output/pcbs/${board}.kicad_pcb -o ergogen/output/pcbs/${board}.dsn    
        ${container_cmd} run ${container_args} ghcr.io/inti-cmnb/kicad7_auto:latest kibot -b ergogen/output/pcbs/${board}.kicad_pcb -c kibot/boards.kibot.yaml
    fi
    if [ -e ergogen/output/pcbs/${board}.dsn ]; then
        echo Autoroute PCB
        java -jar freerouting/freerouting-1.8.0.jar -de ergogen/output/pcbs/${board}.dsn -do ergogen/output/pcbs/${board}.ses -dr freerouting/corney_island.rules
        # ${container_cmd} run ${container_args} soundmonster/freerouting_cli:v0.1.0 java -jar /opt/freerouting_cli.jar -de ergogen/output/pcbs/${board}.dsn -do ergogen/output/pcbs/${board}.ses -dr freerouting/corney_island.rules
    fi
    if [ -e ergogen/output/pcbs/${board}.ses ]; then
        echo "Import SES"
        ${container_cmd} run ${container_args} soundmonster/kicad-automation-scripts:latest /usr/lib/python2.7/dist-packages/kicad-automation/pcbnew_automation/import_ses.py ergogen/output/pcbs/${board}.kicad_pcb ergogen/output/pcbs/${board}.ses --output-file ergogen/output/pcbs/${board}_routed.kicad_pcb
    fi
    if [ -e ergogen/output/pcbs/${board}_routed.kicad_pcb ]; then
        ${container_cmd} run ${container_args} ghcr.io/inti-cmnb/kicad7_auto:latest kibot -b ergogen/output/pcbs/${board}_routed.kicad_pcb -c kibot/boards.kibot.yaml
    fi
done