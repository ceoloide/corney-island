#!/bin/sh
container_cmd=docker
# Ensure we switch to the /board working directory, pointing it
# at the repo root (when running the script from there)
container_args="-w /board -v $(pwd):/board --rm"

# Define the boards to autoroute and export, and the plates
boards="corney_island_wireless corney_island"
plates="backplate frontplate controller_overlay"

# Define the KiCad Auto Docker image to use
kicad_auto_image="ghcr.io/inti-cmnb/kicad8_auto:latest"
freerouting_cli_image="ceoloide/ergogen:2.0.1"

# Preserve manually routed files
if [ -e pcbs/*_manually_routed.kicad_pcb ]; then
    mkdir ergogen/tmp
    mv pcbs/*_manually_routed* ergogen/tmp
fi

# Cleanup the output folder or KiCad will error out
rm -rf outlines
rm -rf pcbs
rm -rf points
rm -rf source
rm -rf cases

# Cleanup Freerouting log outpus
if [ -e freerouting/freerouting.log ]; then
    rm freerouting/freerouting.log
fi
if [ -e logs/freerouting.log ]; then
    rm logs/freerouting.log
fi

# Generate unrouted PCBs with Ergogen (definition in package.json)
npm run debug

# Restore manually routed files
if [ -e ergogen/tmp/*_manually_routed.kicad_pcb ]; then
    mv ergogen/tmp/*_manually_routed* pcbs 
    rm -r ergogen/tmp
fi

if [ ! -e freerouting/freerouting-2.0.1.jar ]; then
    curl https://github.com/freerouting/freerouting/releases/download/v2.0.1/freerouting-2.0.1.jar -L -o freerouting/freerouting-2.0.1.jar
fi

if [ ! -e freerouting/freerouting-SNAPSHOT.jar ]; then
    curl https://github.com/freerouting/freerouting/releases/download/SNAPSHOT/freerouting-SNAPSHOT-20241111_140100.jar -L -o freerouting/freerouting-SNAPSHOT.jar
fi

for plate in ${plates}
do
    echo "\n\n>>>>>> Processing $plate <<<<<<\n\n"
    ${container_cmd} run ${container_args} ${kicad_auto_image} kibot -b pcbs/${plate}.kicad_pcb -c kibot/default.kibot.yaml
done

for board in ${boards}
do
    echo "\n\n>>>>>> Processing $board <<<<<<\n\n"
    if [ -e pcbs/${board}_manually_routed.kicad_pcb ]; then
        ${container_cmd} run ${container_args} ${kicad_auto_image} kibot -b pcbs/${board}_manually_routed.kicad_pcb -c kibot/boards.kibot.yaml
    fi
    if [ -e pcbs/${board}.kicad_pcb ]; then
        echo Export DSN 
        ${container_cmd} run ${container_args} ${kicad_auto_image} kibot/export_dsn.py -b pcbs/${board}.kicad_pcb -o pcbs/${board}.dsn    
        ${container_cmd} run ${container_args} ${kicad_auto_image} kibot -b pcbs/${board}.kicad_pcb -c kibot/default.kibot.yaml
    fi
    if [ -e pcbs/${board}.dsn ]; then
        echo Autoroute PCB
        # ${container_cmd} run ${container_args} ${freerouting_cli_image} java -Dlog4j.configurationFile=file:./freerouting/log4j2.xml -jar /opt/freerouting_cli.jar -de pcbs/${board}.dsn -do pcbs/${board}.ses -dr freerouting/freerouting.rules -mp 20
        ${container_cmd} run ${container_args} ${freerouting_cli_image} java -Dlog4j.configurationFile=file:./freerouting/log4j2.xml -jar /opt/freerouting.jar -de pcbs/${board}.dsn -do pcbs/${board}.ses --user-data-path ./freerouting -mp 20 -mt 1 -dct 0 --gui.enabled=false --profile.email=marco.massarelli@gmail.com
        # java -Dlog4j.configurationFile=file:./freerouting/log4j2.xml -jar freerouting/freerouting-2.0.1.jar -de pcbs/${board}.dsn -do pcbs/${board}.ses --user-data-path ./freerouting -mp 20 -mt 1 -dct 0 --gui.enabled=false --profile.email=marco.massarelli@gmail.com
        # java -Dlog4j.configurationFile=file:./freerouting/log4j2.xml -jar freerouting/freerouting-SNAPSHOT.jar -de pcbs/${board}.dsn -do pcbs/${board}.ses --user-data-path ./freerouting -mp 20 -mt 1 -dct 0 --gui.enabled=false --profile.email=marco.massarelli@gmail.com
    fi
    if [ -e pcbs/${board}.ses ]; then
        echo "Import SES"
        # ${container_cmd} run ${container_args} soundmonster/kicad-automation-scripts:latest /bin/sh -c "mkdir -p $HOME/.config/kicad; cp /root/.config/kicad/* $HOME/.config/kicad"
        # ${container_cmd} run ${container_args} soundmonster/kicad-automation-scripts:latest /usr/lib/python2.7/dist-packages/kicad-automation/pcbnew_automation/import_ses.py pcbs/${board}.kicad_pcb pcbs/${board}.ses --output-file pcbs/${board}_autorouted.kicad_pcb
        ${container_cmd} run ${container_args} ${kicad_auto_image} kibot/import_ses.py -b pcbs/${board}.kicad_pcb -s pcbs/${board}.ses -o pcbs/${board}_autorouted.kicad_pcb
        # sed -i -e 's/(version 20231007)/(version 20221018)/g' ${board}_autorouted.kicad_pcb
    fi
    if [ -e pcbs/${board}_autorouted.kicad_pcb ]; then
        ${container_cmd} run ${container_args} ${kicad_auto_image} kibot -b pcbs/${board}_autorouted.kicad_pcb -c kibot/boards.kibot.yaml
    fi
done

# Docker runs as root and causes issues with file ownership
sudo chown $USER -R ergogen
sudo chown $USER -R freerouting
