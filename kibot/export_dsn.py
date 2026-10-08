#!/usr/bin/env python3
"""Export native KiCad DSN, restoring source precision without moving geometry."""
import argparse
import os
from pathlib import Path
import tempfile

from dsn_precision import SourceGeometry, parse, restore


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('-b', '--board', required=True)
    parser.add_argument('-o', '--output', required=True)
    args = parser.parse_args()
    import pcbnew

    target = Path(args.output)
    # The normalized front-view copy is never saved to the source PCB.
    source = SourceGeometry.from_board(pcbnew.LoadBoard(args.board), pcbnew)
    board = pcbnew.LoadBoard(args.board)
    fd, temporary = tempfile.mkstemp(suffix='.dsn', prefix='.precision-', dir=target.parent)
    os.close(fd)
    try:
        if not pcbnew.ExportSpecctraDSN(board, temporary):
            raise RuntimeError('Could not export Specctra DSN: ' + args.board)
        text, counts = restore(Path(temporary).read_text(), source)
        identifier = parse(text).children[1]
        name = str(target)
        if any(c.isspace() or c in '()"' for c in name):
            name = '"' + name.replace('\\', '\\\\').replace('"', '\\"') + '"'
        text = text[:identifier.start] + name + text[identifier.end:]
        Path(temporary).write_text(text)
        # mkstemp creates mode 0600; container-generated exports must also be
        # readable by the host/CI artifact uploader after the atomic rename.
        os.chmod(temporary, 0o644)
        os.replace(temporary, target)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)
    print('Exported', target, 'with source precision; changed numeric tokens:', counts)
    print('Native keepouts, rules, and DSN resolution preserved. No contact snapping applied.')


if __name__ == '__main__':
    main()
