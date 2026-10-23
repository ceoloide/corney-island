"""Exercise batch failure handling without generating or routing real boards."""
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]


class BuildTest(unittest.TestCase):
    def test_failed_boards_do_not_stop_batch_and_custom_rules_survive(self):
        for neckdown in ('true', 'false'):
            for image in (None, 'local/ergogen-freerouting:patched'):
                with self.subTest(neckdown=neckdown, image=image):
                    self.check_build(neckdown, image)

    def check_build(self, neckdown, image):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            (root / 'bin').mkdir()
            (root / 'pcbs').mkdir()
            (root / 'freerouting').mkdir()
            (root / 'gerbers').mkdir()
            (root / 'images').mkdir()
            (root / 'kibot/drc').mkdir(parents=True)
            (root / 'kibot/drc/good_autorouted-drc.html').write_text('stale report')
            (root / 'gerbers/drcbad_autorouted.zip').write_text('stale fabrication')
            (root / 'gerbers/frontplate.zip').write_text('stale plate fabrication')
            (root / 'images/routebad_autorouted-top.png').write_text('stale image')
            custom = '(version 1)\n# User custom rules\n'
            (root / 'pcbs/drcbad.kicad_dru').write_text(custom)
            (root / 'freerouting/freerouting.rules').write_text('mock')
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
if 'kibot/boards.kibot.yaml' in args:
 stale=pathlib.Path('kibot/drc') / (pathlib.Path(value('-b')).stem+'-drc.html')
 if stale.exists(): sys.exit(7)
if 'kicad-cli' in args:
 report=value('-o'); board=args[-1]
 pathlib.Path(board+'-bak').touch()
 error='drcbad_autorouted' in board or board.endswith('frontplate.kicad_pcb')
 missing='routebad_autorouted' in board
 pathlib.Path(report).write_text(json.dumps({'unconnected_items':[{}] if missing else [],'violations':[{'type':'clearance','severity':'error'}] if error else []}))
if 'kibot/routing_status.py' in args:
 data=json.loads(pathlib.Path(args[-1]).read_text())
 sys.exit(2 if data['unconnected_items'] or data['violations'] else 0)
''')
            for executable in (root / 'bin').iterdir():
                executable.chmod(0o755)
            environment = {**os.environ, 'FREEROUTING_NECKDOWN': neckdown,
                           'PATH': str(root / 'bin') + ':' + os.environ['PATH']}
            environment.pop('ERGOGEN_DOCKER_IMAGE', None)
            if image:
                environment['ERGOGEN_DOCKER_IMAGE'] = image
            result = subprocess.run(['sh', str(ROOT / 'build.sh'), 'drcbad', 'routebad', 'good'], cwd=root,
                                    env=environment,
                                    capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertIn('FAILED: frontplate', result.stderr)
            self.assertIn('FAILED: drcbad', result.stderr)
            self.assertIn('FAILED: routebad', result.stderr)
            self.assertNotIn('FAILED: good', result.stderr)
            calls = (root / 'calls.log').read_text().splitlines()
            expected_image = image or 'ceoloide/ergogen-freerouting:k9_snapshot_20261020_121300'
            for call in calls:
                self.assertIn(f'run --user {os.getuid()}:{os.getgid()} -e HOME=/tmp ', call)
                self.assertIn(expected_image + ' ', call)
            routing_calls = [line for line in calls if ' java ' in line]
            self.assertEqual(len(routing_calls), 3)
            for call in routing_calls:
                self.assertIn(expected_image + ' java ', call)
                self.assertIn('-jar /opt/freerouting.jar', call)
                self.assertIn('--router.fanout.enabled=false', call)
                self.assertIn('--router.optimizer.max_threads=1', call)
                self.assertIn('--router.job_timeout=00:20:00', call)
                self.assertIn(f'--router.automatic_neckdown={neckdown}', call)
                self.assertIn(f'--router.neck_width_um={100 if neckdown == "true" else 0}', call)
            exports = [line for line in calls if ' kibot -b pcbs/' in line and '_autorouted.kicad_pcb' in line]
            self.assertEqual(len(exports), 1)
            self.assertIn('good_autorouted', exports[0])
            self.assertEqual((root / 'pcbs/drcbad.kicad_dru').read_text(), custom)
            self.assertEqual((root / 'pcbs/drcbad_autorouted.kicad_dru').read_text(), custom)
            self.assertFalse((root / 'freerouting/good.rules').exists())
            self.assertFalse((root / 'gerbers/drcbad_autorouted.zip').exists())
            self.assertFalse((root / 'gerbers/frontplate.zip').exists())
            self.assertEqual(list((root / 'pcbs').glob('*-bak')), [])
            self.assertFalse((root / 'images/routebad_autorouted-top.png').exists())
            self.assertFalse((root / 'kibot/drc/good_autorouted-drc.html').exists())


if __name__ == '__main__':
    unittest.main()
