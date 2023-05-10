#!/bin/sh
container_cmd=docker
# Ensure we switch to the /board working directory, pointing it
# at the repo root (when running the script from there)
container_args="-w /board -v $(pwd):/board --rm"

# Cleanup the output folder or KiCad will error out
rm -rf ergogen/output

# Generate unrouted PCBs with Ergogen (definition in package.json)
npm run gen

# Define the boards to autoroute and export
boards=corney_island

# Define the fabrication profile and additional flags
fab=jlcpcb
flags=--no-assembly

for board in ${boards};
do
    echo Processing $board
    ${container_cmd} run ${container_args} soundmonster/kicad-automation-scripts:latest /bin/sh -c "mkdir -p $HOME/.config/kicad; cp /root/.config/kicad/* $HOME/.config/kicad"
    echo Export DSN 
    ${container_cmd} run ${container_args} soundmonster/kicad-automation-scripts:latest /usr/lib/python2.7/dist-packages/kicad-automation/pcbnew_automation/export_dsn.py ergogen/output/pcbs/${boards}.kicad_pcb ergogen/output/pcbs/${boards}.dsn
    echo Autoroute PCB
    ${container_cmd} run ${container_args} soundmonster/freerouting_cli:v0.1.0 java -jar /opt/freerouting_cli.jar -de ergogen/output/pcbs/${board}.dsn -do ergogen/output/pcbs/${board}.ses
    echo "Import SES"
    ${container_cmd} run ${container_args} soundmonster/kicad-automation-scripts:latest /usr/lib/python2.7/dist-packages/kicad-automation/pcbnew_automation/import_ses.py ergogen/output/pcbs/${boards}.kicad_pcb ergogen/output/pcbs/${boards}.ses --output-file ergogen/output/pcbs/${boards}_routed.kicad_pcb
    echo "DRC check"
    ${container_cmd} run ${container_args} soundmonster/kicad-automation-scripts:latest /usr/lib/python2.7/dist-packages/kicad-automation/pcbnew_automation/run_drc.py $GITHUB_WORKSPACE/ergogen/output/pcbs/${board}_routed.kicad_pcb $GITHUB_WORKSPACE/ergogen/output/pcbs/${board}_drc/
    echo "Export Gerbers"
    mkdir -p ergogen/output/gerbers/${board}
    ${container_cmd} run ${container_args} yaqwsx/kikit:v0.7 kikit fab ${fab} ${flags} ergogen/output/pcbs/${board}_routed.kicad_pcb ergogen/output/gerbers/${board}
    mv ergogen/output/gerbers/${board}/gerbers.zip ergogen/output/gerbers/${board}.zip
    echo "Generate PCB images"
    mkdir -p ergogen/output/images
    ${container_cmd} run ${container_args} yaqwsx/kikit:v0.7 pcbdraw --style builtin:set-black-hasl.json ergogen/output/pcbs/${board}_routed.kicad_pcb ergogen/output/images/${board}_front.png
    ${container_cmd} run ${container_args} yaqwsx/kikit:v0.7 pcbdraw -b --style builtin:set-black-hasl.json ergogen/output/pcbs/${board}_routed.kicad_pcb ergogen/output/images/${board}_back.png
done
