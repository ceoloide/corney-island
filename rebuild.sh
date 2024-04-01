#!/bin/sh
container_cmd=docker
# Ensure we switch to the /board working directory, pointing it
# at the repo root (when running the script from there)
container_args="-w /board -v $(pwd):/board --rm"

# Define the boards to autoroute and export, and the plates
boards="corney_island_wireless"
# kicad_auto_image="ghcr.io/inti-cmnb/kicad7_auto:latest"
kicad_auto_image="setsoft/kicad_auto:ki8"
# freerouting_cli_image="ceoloide/kicad_auto:nightly"
freerouting_cli_image="soundmonster/freerouting_cli:v0.1.0"

# Cleanup Freerouting log outpus
if [ -e freerouting/freerouting.log ]; then
    rm freerouting/freerouting.log
fi
if [ -e logs/freerouting.log ]; then
    rm logs/freerouting.log
fi

if [ ! -e freerouting/freerouting-1.9.0.jar ]; then
    curl https://github.com/freerouting/freerouting/releases/download/v1.9.0/freerouting-1.9.0.jar -L -o freerouting/freerouting-1.9.0.jar
fi

for board in ${boards}
do
    echo "\n\n>>>>>> Processing $board <<<<<<\n\n"

    # Cleanup the outputs
    rm -f ergogen/output/pcbs/${board}.dsn  
    rm -f ergogen/output/pcbs/${board}.ses  
    rm -f ergogen/output/pcbs/${board}.pro  
    rm -f ergogen/output/pcbs/${board}_autorouted.kicad_pcb  
 
    if [ -e ergogen/output/pcbs/${board}.kicad_pcb ]; then
        echo Export DSN 
        ${container_cmd} run ${container_args} ${kicad_auto_image} kibot/export_dsn.py -b ergogen/output/pcbs/${board}.kicad_pcb -o ergogen/output/pcbs/${board}.dsn    
        ${container_cmd} run ${container_args} ${kicad_auto_image} kibot -b ergogen/output/pcbs/${board}.kicad_pcb -c kibot/default.kibot.yaml
    fi
    if [ -e ergogen/output/pcbs/${board}.dsn ]; then
        echo Autoroute PCB
        # xvfb-run -a java -Dlog4j.configurationFile=file:./freerouting/log4j2.xml -jar freerouting/freerouting-cli.jar -de ergogen/output/pcbs/${board}.dsn -do ergogen/output/pcbs/${board}.ses -dr freerouting/freerouting.rules -mp 20
        # xvfb-run -a java -Dlog4j.configurationFile=file:./freerouting/log4j2.xml -jar freerouting/freerouting-1.6.5.jar -de ergogen/output/pcbs/${board}.dsn -do ergogen/output/pcbs/${board}.ses -dr freerouting/freerouting.rules -mp 20
        # xvfb-run -a java -Dlog4j.configurationFile=file:./freerouting/log4j2.xml -jar freerouting/freerouting-1.7.0.jar -de ergogen/output/pcbs/${board}.dsn -do ergogen/output/pcbs/${board}.ses -dr freerouting/freerouting.rules -mp 20        # xvfb-run -a java -Dlog4j.configurationFile=file:./freerouting/log4j2.xml -jar freerouting/freerouting-1.8.0.jar -de ergogen/output/pcbs/${board}.dsn -do ergogen/output/pcbs/${board}.ses -dr freerouting/freerouting.rules -mp 20 -dct 1
        # xvfb-run -a java -Dlog4j.configurationFile=file:./freerouting/log4j2.xml -jar freerouting/freerouting-1.9.0.jar -de ergogen/output/pcbs/${board}.dsn -do ergogen/output/pcbs/${board}.ses -dr freerouting/freerouting.rules -mp 20 -dct 1
        # xvfb-run -a java -Dlog4j.configurationFile=file:./freerouting/log4j2.xml -jar freerouting/freerouting-test.jar -de ergogen/output/pcbs/${board}.dsn -do ergogen/output/pcbs/${board}.ses -dr freerouting/freerouting.rules -mp 20 -dct 1
        ${container_cmd} run ${container_args} ${freerouting_cli_image} java -Dlog4j.configurationFile=file:./freerouting/log4j2.xml -jar /opt/freerouting_cli.jar -de ergogen/output/pcbs/${board}.dsn -do ergogen/output/pcbs/${board}.ses -dr freerouting/freerouting.rules -mp 20
        # ${container_cmd} run ${container_args} nixos/nix nix-shell --argstr board ${board}
    fi
    if [ -e ergogen/output/pcbs/${board}.ses ]; then
        echo "Import SES"
        ${container_cmd} run ${container_args} soundmonster/kicad-automation-scripts:latest /bin/bash -c "mkdir -p $HOME/.config/kicad; cp /root/.config/kicad/* $HOME/.config/kicad"
        ${container_cmd} run ${container_args} soundmonster/kicad-automation-scripts:latest /usr/lib/python2.7/dist-packages/kicad-automation/pcbnew_automation/import_ses.py ergogen/output/pcbs/${board}.kicad_pcb ergogen/output/pcbs/${board}.ses --output-file ergogen/output/pcbs/${board}_autorouted.kicad_pcb
        # ${container_cmd} run ${container_args} ${kicad_auto_image} kibot/import_ses.py -b ergogen/output/pcbs/${board}.kicad_pcb -s ergogen/output/pcbs/${board}.ses -o ergogen/output/pcbs/${board}_autorouted.kicad_pcb
    fi
    if [ -e ergogen/output/pcbs/${board}_autorouted.kicad_pcb ]; then
        ${container_cmd} run ${container_args} ${kicad_auto_image} kibot -b ergogen/output/pcbs/${board}_autorouted.kicad_pcb -c kibot/boards.kibot.yaml
    fi
done

# Docker runs as root and causes issues with file ownership
sudo chown $USER -R ergogen
sudo chown $USER -R freerouting
