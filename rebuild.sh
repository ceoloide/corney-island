#!/bin/sh
container_cmd=docker
# Ensure we switch to the /board working directory, pointing it
# at the repo root (when running the script from there)
container_args="-w /board -v $(pwd):/board --rm"

# Define the boards to autoroute and export, and the plates
boards="corney_island corney_island_wireless"
kicad_auto_image="ghcr.io/inti-cmnb/kicad8_auto:latest"
freerouting_cli_image="ceoloide/ergogen-freerouting:latest"

# Cleanup Freerouting log outpus
if [ -e freerouting/freerouting.log ]; then
    rm freerouting/freerouting.log
fi
if [ -e logs/freerouting.log ]; then
    rm logs/freerouting.log
fi

if [ ! -e freerouting/freerouting-2.1.0.jar ]; then
    curl https://github.com/freerouting/freerouting/releases/download/v2.1.0/freerouting-2.1.0.jar -L -o freerouting/freerouting-2.1.0.jar
fi

if [ ! -e freerouting/freerouting-SNAPSHOT.jar ]; then
    curl https://github.com/freerouting/freerouting/releases/download/SNAPSHOT/freerouting-SNAPSHOT-20241111_140100.jar -L -o freerouting/freerouting-SNAPSHOT.jar
fi

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
        # ${container_cmd} run ${container_args} ${freerouting_cli_image} java -Dlog4j.configurationFile=file:./freerouting/log4j2.xml -jar /opt/freerouting_cli.jar -de pcbs/${board}.dsn -do pcbs/${board}.ses -dr freerouting/freerouting.rules -mp 20
        ${container_cmd} run ${container_args} ${freerouting_cli_image} java -Dlog4j.configurationFile=file:./freerouting/log4j2.xml -jar /opt/freerouting.jar -de pcbs/${board}.dsn -do pcbs/${board}.ses  -dr ./freerouting/freerouting.rules --user-data-path ./freerouting -mp 20 -mt 1 -dct 0 --gui.enabled=false --profile.email=marco.massarelli@gmail.com
        # java -Dlog4j.configurationFile=file:./freerouting/log4j2.xml -jar freerouting/freerouting-2.1.0.jar -de pcbs/${board}.dsn -do pcbs/${board}.ses --user-data-path ./freerouting -mp 20 -mt 1 -dct 0 --gui.enabled=false --profile.email=marco.massarelli@gmail.com
        # java -Dlog4j.configurationFile=file:./freerouting/log4j2.xml -jar freerouting/freerouting-SNAPSHOT.jar -de pcbs/${board}.dsn -do pcbs/${board}.ses --user-data-path ./freerouting -mp 20 -mt 1 -dct 0 --gui.enabled=false --profile.email=marco.massarelli@gmail.com
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
sudo chown $USER -R ergogen
sudo chown $USER -R freerouting
