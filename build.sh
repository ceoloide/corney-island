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

for plate in ${plates}
do
    echo "\n\n>>>>>> Processing $plate <<<<<<\n\n"
    echo "Export Gerbers"
    mkdir -p ergogen/output/gerbers/${plate}
    ${container_cmd} run ${container_args} yaqwsx/kikit:v1.1.2 kikit fab ${fab} ${flags} --no-drc ergogen/output/pcbs/${plate}.kicad_pcb ergogen/output/gerbers/${plate}
    mv ergogen/output/gerbers/${plate}/gerbers.zip ergogen/output/gerbers/${plate}.zip
    echo "Generate PCB images"
    mkdir -p ergogen/output/images
    ${container_cmd} run ${container_args} yaqwsx/kikit:v1.1.2 pcbdraw plot --style ${pcbdraw_style} ergogen/output/pcbs/${plate}.kicad_pcb ergogen/output/images/${plate}.svg
done

for board in ${boards}
do
    echo "\n\n>>>>>> Processing $board <<<<<<\n\n"
    ${container_cmd} run ${container_args} soundmonster/kicad-automation-scripts:latest /bin/sh -c "mkdir -p $HOME/.config/kicad; cp /root/.config/kicad/* $HOME/.config/kicad"
    if [ -e ergogen/output/pcbs/${board}.kicad_pcb ]; then
        echo Export DSN 
        ${container_cmd} run ${container_args} soundmonster/kicad-automation-scripts:latest /usr/lib/python2.7/dist-packages/kicad-automation/pcbnew_automation/export_dsn.py ergogen/output/pcbs/${board}.kicad_pcb ergogen/output/pcbs/${board}.dsn    
    fi
    if [ -e ergogen/output/pcbs/${board}.dsn ]; then
        echo Autoroute PCB
        ${container_cmd} run ${container_args} soundmonster/freerouting_cli:v0.1.0 java -jar /opt/freerouting_cli.jar -de ergogen/output/pcbs/${board}.dsn -do ergogen/output/pcbs/${board}.ses
    fi
    if [ -e ergogen/output/pcbs/${board}.ses ]; then
        echo "Import SES"
        ${container_cmd} run ${container_args} soundmonster/kicad-automation-scripts:latest /usr/lib/python2.7/dist-packages/kicad-automation/pcbnew_automation/import_ses.py ergogen/output/pcbs/${board}.kicad_pcb ergogen/output/pcbs/${board}.ses --output-file ergogen/output/pcbs/${board}_routed.kicad_pcb
    fi
    if [ -e ergogen/output/pcbs/${board}_routed.kicad_pcb ]; then
        echo "DRC check"
        ${container_cmd} run ${container_args} soundmonster/kicad-automation-scripts:latest /usr/lib/python2.7/dist-packages/kicad-automation/pcbnew_automation/run_drc.py $GITHUB_WORKSPACE/ergogen/output/pcbs/${board}_routed.kicad_pcb $GITHUB_WORKSPACE/ergogen/output/pcbs/${board}_drc/
        echo "Export Gerbers"
        mkdir -p ergogen/output/gerbers/${board}
        ${container_cmd} run ${container_args} yaqwsx/kikit:v0.7 kikit fab ${fab} ${flags} ergogen/output/pcbs/${board}_routed.kicad_pcb ergogen/output/gerbers/${board}
        mv ergogen/output/gerbers/${board}/gerbers.zip ergogen/output/gerbers/${board}.zip
        echo "Generate PCB images"
        mkdir -p ergogen/output/images
        ${container_cmd} run ${container_args} yaqwsx/kikit:v0.7 pcbdraw --style builtin:${pcbdraw_style}.json ergogen/output/pcbs/${board}_routed.kicad_pcb ergogen/output/images/${board}_front.png
        ${container_cmd} run ${container_args} yaqwsx/kikit:v0.7 pcbdraw -b --style builtin:${pcbdraw_style}.json ergogen/output/pcbs/${board}_routed.kicad_pcb ergogen/output/images/${board}_back.png
    fi
done