#!/usr/bin/env python3
"""Reject stale routing binaries before replacing generated boards."""
import json
from pathlib import Path
import sys
from zipfile import ZipFile


def verify(jar, expected):
    with ZipFile(jar) as archive:
        manifest = archive.read('META-INF/MANIFEST.MF').decode().replace('\r\n ', '')
        fields = dict(line.split(': ', 1) for line in manifest.splitlines() if ': ' in line)
        constants = archive.read('app/freerouting/constants/Constants.class')
    version = expected['version'].encode()
    # A JVM CONSTANT_Utf8 entry: tag, two-byte length, then the exact version.
    if b'\x01' + len(version).to_bytes(2, 'big') + version not in constants:
        raise ValueError('Expected Freerouting ' + expected['version'])
    if fields.get('Build-Revision') != expected['revision']:
        raise ValueError('Expected Freerouting revision ' + expected['revision'])
    print('Freerouting', expected['version'], 'at', expected['revision'])


if __name__ == '__main__':
    expected = json.loads((Path(__file__).resolve().parents[1] / 'freerouting/build.json').read_text())
    verify(sys.argv[1], expected)
