default: build

build:
  ./build.sh

preview:
  ./preview.sh

watch:
  echo ./ergogen/config.yaml | entr ./preview.sh

clean:  
	rm -rf ergogen/output
