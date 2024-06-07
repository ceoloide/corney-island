#!/bin/sh
container_cmd=docker
# Ensure we switch to the /board working directory, pointing it
# at the repo root (when running the script from there)
container_args="-w /board -v $(pwd):/board --rm"

# Define the boards to autoroute and export, and the plates
boards="left right"
plates="" #TODO

# Define the KiCad Auto Docker image to use
kicad_auto_image="setsoft/kicad_auto:ki8"
# kicad_auto_image="ceoloide/kicad_auto:nightly"

# Cleanup the output folder or KiCad will error out
rm -rf ergogen/output

if [ ! -d node_modules ]; then
	npm install
fi

# Generate unrouted PCBs with Ergogen (definition in package.json)
echo Generating preview
npm run debug >/dev/null

convert -border 20x20 +level-colors white,black ergogen/output/points/demo.svg sixel:-
echo
convert -border 20x20 +level-colors white,black ergogen/output/outlines/combined.svg sixel:-
echo

for plate in ${plates}; do
	${container_cmd} run ${container_args} ${kicad_auto_image} kibot -b ergogen/output/pcbs/${plate}.kicad_pcb -c kibot/preview.kibot.yaml >/dev/null
done

for board in ${boards}; do
	${container_cmd} run ${container_args} ${kicad_auto_image} kibot -b ergogen/output/pcbs/${board}.kicad_pcb -c kibot/preview.kibot.yaml >/dev/null
done
montage ergogen/output/images/*top.png -geometry 800x480 -background none sixel:-
echo
montage ergogen/output/images/*bottom.png -geometry 800x480 -background none sixel:-
# Docker runs as root and causes issues with file ownership
