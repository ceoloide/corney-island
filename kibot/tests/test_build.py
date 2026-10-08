"""Exercise batch failure handling without generating or routing real boards."""
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]


class BuildTest(unittest.TestCase):
    def test_failed_boards_do_not_stop_batch_and_custom_rules_survive(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            (root / 'bin').mkdir()
            (root / 'pcbs').mkdir()
            (root / 'freerouting').mkdir()
            custom = '(version 1)\n# User custom rules\n'
            (root / 'pcbs/drcbad.kicad_dru').write_text(custom)
            for name in ('freerouting-2.1.0.jar', 'freerouting-SNAPSHOT.jar', 'freerouting.rules'):
                (root / 'freerouting' / name).write_text('')
            (root / 'bin/npm').write_text('''#!/bin/sh
mkdir -p pcbs
for board in drcbad routebad good; do touch "pcbs/$board.kicad_pcb"; done
''')
            (root / 'bin/docker').write_text('''#!/usr/bin/env python3
import json, pathlib, sys
args=sys.argv[1:]
pathlib.Path('calls.log').open('a').write(' '.join(args)+'\\n')
def value(flag): return args[args.index(flag)+1]
if 'chown' in args: sys.exit(0)
if 'kibot/configure_jlcpcb.py' in args:
 p=pathlib.Path(args[-1]); p.with_suffix('.kicad_pro').write_text('{}')
 if not p.with_suffix('.kicad_dru').exists(): p.with_suffix('.kicad_dru').write_text('(version 1)')
if 'kibot/export_dsn.py' in args or 'kibot/import_ses.py' in args:
 pathlib.Path(value('-o')).touch()
if 'java' in args: pathlib.Path(value('-do')).touch()
if 'kicad-cli' in args:
 report=value('-o'); board=args[-1]
 error='drcbad_autorouted' in board
 missing='routebad_autorouted' in board
 pathlib.Path(report).write_text(json.dumps({'unconnected_items':[{}] if missing else [],'violations':[{'type':'clearance','severity':'error'}] if error else []}))
if 'kibot/routing_status.py' in args:
 data=json.loads(pathlib.Path(args[-1]).read_text())
 sys.exit(2 if data['unconnected_items'] or data['violations'] else 0)
''')
            for executable in (root / 'bin').iterdir():
                executable.chmod(0o755)
            result = subprocess.run(['sh', str(ROOT / 'build.sh'), 'drcbad', 'routebad', 'good'], cwd=root,
                                    env={**os.environ, 'PATH': str(root / 'bin') + ':' + os.environ['PATH']},
                                    capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertIn('FAILED: drcbad', result.stderr)
            self.assertIn('FAILED: routebad', result.stderr)
            self.assertNotIn('FAILED: good', result.stderr)
            calls = (root / 'calls.log').read_text().splitlines()
            exports = [line for line in calls if ' kibot -b pcbs/' in line and '_autorouted.kicad_pcb' in line]
            self.assertEqual(len(exports), 1)
            self.assertIn('good_autorouted', exports[0])
            self.assertEqual((root / 'pcbs/drcbad.kicad_dru').read_text(), custom)
            self.assertEqual((root / 'pcbs/drcbad_autorouted.kicad_dru').read_text(), custom)
            self.assertFalse((root / 'freerouting/good.rules').exists())


if __name__ == '__main__':
    unittest.main()
