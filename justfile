default:
  @just --list
build: ergogen cases plates autorouting kicad-export
set export


# Define the boards to autoroute and export, and the plates
boards := "left right"
plates := "plate_left plate_right" #TODO
cases  := "" #TODO

pwd := `pwd`
container_cmd := "docker"
kicad_auto_image := "setsoft/kicad_auto:ki8"
freerouting_cli_image := "soundmonster/freerouting_cli:v0.1.0"

_prepare:
  #!/usr/bin/env sh
  # Preserve manually routed files
  if [ -e ergogen/output/pcbs/*_manually_routed.kicad_pcb ]; then
    mkdir ergogen/tmp
    mv ergogen/output/pcbs/*_manually_routed* ergogen/tmp
  fi

  # Cleanup the output folder or KiCad will error out
  rm -rf ergogen/output

  # Cleanup Freerouting log outpus
  if [ -e freerouting/freerouting.log ]; then
    rm freerouting/freerouting.log
  fi
  if [ -e logs/freerouting.log ]; then
    rm logs/freerouting.log
  fi
  if [ ! -d node_modules ]; then
    npm install
  fi
  if [ ! -e freerouting/freerouting-1.9.0.jar ]; then
    curl https://github.com/freerouting/freerouting/releases/download/v1.9.0/freerouting-1.9.0.jar -L -o freerouting/freerouting-1.9.0.jar
  fi

  if [ ! -e freerouting/freerouting-SNAPSHOT.jar ]; then
    curl https://github.com/freerouting/freerouting/releases/download/SNAPSHOT/freerouting-SNAPSHOT-20240405_140200.jar -L -o freerouting/freerouting-SNAPSHOT.jar
  fi

ergogen: _prepare
  # Generate unrouted PCBs with Ergogen (definition in package.json)
  @npm run debug > /dev/null

cases:
  #!/usr/bin/env sh
  for case in ${cases}; do
    npx @jscad/cli ergogen/output/cases/${case}.jscad -of stla -o ergogen/output/cases/${case}.stl
  done

plates: ergogen
  #!/usr/bin/env sh
  for plate in ${plates}; do
    echo "\n\n>>>>>> Processing $plate <<<<<<\n\n"
    ${container_cmd} run -w /board -v $(pwd):/board --rm ${kicad_auto_image} kibot -b ergogen/output/pcbs/${plate}.kicad_pcb -c kibot/default.kibot.yaml
  done

autorouting:
  #!/usr/bin/env sh
  set -x
  # Restore manually routed files
  if [ -e ergogen/tmp/*_manually_routed.kicad_pcb ]; then
    mv ergogen/tmp/*_manually_routed* ergogen/output/pcbs
    rm -r ergogen/tmp
  fi
  for board in ${boards}; do
    echo "\n\n>>>>>> Processing $board <<<<<<\n\n"
    if [ -e ergogen/output/pcbs/${board}_manually_routed.kicad_pcb ]; then
      ${container_cmd} run -w /board -v $(pwd):/board --rm ${kicad_auto_image} kibot -b ergogen/output/pcbs/${board}_manually_routed.kicad_pcb -c kibot/boards.kibot.yaml
    fi
    if [ -e ergogen/output/pcbs/${board}.kicad_pcb ]; then
      echo Export DSN
      ${container_cmd} run -w /board -v $(pwd):/board --rm ${kicad_auto_image} kibot/export_dsn.py -b ergogen/output/pcbs/${board}.kicad_pcb -o ergogen/output/pcbs/${board}.dsn
      ${container_cmd} run -w /board -v $(pwd):/board --rm ${kicad_auto_image} kibot -b ergogen/output/pcbs/${board}.kicad_pcb -c kibot/default.kibot.yaml
    fi
    if [ -e ergogen/output/pcbs/${board}.dsn ]; then
      echo Autoroute PCB
      ${container_cmd} run -w /board -v $(pwd):/board --rm ${freerouting_cli_image} java -Dlog4j.configurationFile=file:./freerouting/log4j2.xml -jar /opt/freerouting_cli.jar -de ergogen/output/pcbs/${board}.dsn -do ergogen/output/pcbs/${board}.ses -mp 20
    fi
    if [ -e ergogen/output/pcbs/${board}.ses ]; then
      echo "Import SES"
      ${container_cmd} run -w /board -v $(pwd):/board --rm ${kicad_auto_image} kibot/import_ses.py -b ergogen/output/pcbs/${board}.kicad_pcb -s ergogen/output/pcbs/${board}.ses -o ergogen/output/pcbs/${board}_autorouted.kicad_pcb
    fi
  done

kicad-export:
  #!/usr/bin/env sh
  for board in ${boards}; do
    if [ -e ergogen/output/pcbs/${board}_autorouted.kicad_pcb ]; then
      ${container_cmd} run -w /board -v $(pwd):/board --rm ${kicad_auto_image} kibot -b ergogen/output/pcbs/${board}_autorouted.kicad_pcb -c kibot/boards.kibot.yaml
    fi
  done


@preview: ergogen plates 
  #!/usr/bin/env sh
  convert -border 20x20 +level-colors white,black ergogen/output/points/demo.svg sixel:-
  echo
  convert -border 20x20 +level-colors white,black ergogen/output/outlines/combined.svg sixel:-
  echo

  for plate in ${plates}; do
    ${container_cmd} run -w /board -v $(pwd):/board --rm ${kicad_auto_image} kibot -b ergogen/output/pcbs/${plate}.kicad_pcb -c kibot/preview.kibot.yaml >/dev/null
  done

  for board in ${boards}; do
    ${container_cmd} run -w /board -v $(pwd):/board --rm ${kicad_auto_image} kibot -b ergogen/output/pcbs/${board}.kicad_pcb -c kibot/preview.kibot.yaml >/dev/null
  done
  montage ergogen/output/images/*top.png -geometry 800x480 -background none sixel:-
  echo
  montage ergogen/output/images/*bottom.png -geometry 800x480 -background none sixel:-
  

watch:
  @echo Watching for changes to ./ergogen/config.yaml
  @echo ./ergogen/config.yaml | entr -p just preview

clean:  
	rm -rf ergogen/output
