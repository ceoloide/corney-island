# Corney Island Keyboard

This repository contains the design files for the Corney Island keyboard, a custom ergonomic mechanical keyboard. The design is generated using [Ergogen](https://github.com/ergogen/ergogen), a tool for creating parametric keyboard layouts.

This project was created following the excellent [FlatFootFox blog post series](https://flatfootfox.com/ergogen-introduction/) on how to build a keyboard with Ergogen.

## Purpose

The main purpose of this repository is to provide a complete guide for a new developer to understand, set up, and build a custom ergonomic keyboard. It serves as a practical example of using Ergogen and other tools to go from a keyboard layout concept to a manufacturable PCB design.

## Setup

To build this project, you will need to have the following software installed on your system:

- [Node.js](https://nodejs.org/) (v16 or later)
- [Docker](https://www.docker.com/)

Once you have cloned this repository, you need to install the project dependencies by running the following command in the root of the repository:

```bash
npm install
```

## Usage

There are two ways to build the project:

### Simple Build

For a simple build that only generates the unrouted PCBs and the case, you can run the following command:

```bash
npm run build
```

This command will run Ergogen to generate the keyboard layout and then use JSCAD to create the 3D model of the case.

### Complete Build

For a complete build that also performs autorouting of the PCBs, you can use the `build.sh` script:

```bash
./build.sh
```

This script will:
1.  Generate the unrouted PCBs with Ergogen.
2.  Use Docker to run KiCad and FreeRouting to automatically route the PCBs.
3.  Generate Gerbers and other manufacturing files.

**Note:** The complete build requires Docker to be running.

## Next Steps

After running the build script, you will have a set of unrouted PCB files in the `pcbs` directory. These files need to be opened in [KiCad](https://www.kicad.org/) to be manually routed or to clean up the autorouted traces.

For a detailed guide on how to route the PCB in KiCad, please refer to the [FlatFootFox blog post on KiCad, Firmware, and Assembly](https://flatfootfox.com/ergogen-part5-kicad-firmware-assembly/).

## Credits

This project would not have been possible without the excellent [FlatFootFox blog post series](https://flatfootfox.com/ergogen-introduction/) on how to build a keyboard with Ergogen. The series provides a comprehensive walkthrough of the entire process, from setting up Ergogen to assembling the final keyboard.
