#!/usr/bin/env python3
"""Exit nonzero for incomplete routing or unfiltered KiCad DRC errors."""
import json
import sys
from collections import Counter
from pathlib import Path

report = Path(sys.argv[1])
data = json.loads(report.read_text())
missing = data['unconnected_items']
errors = [item for item in data['violations'] if item['severity'] == 'error']
print(f'Routing check: {len(missing)} missing connections, {len(errors)} DRC errors. Report: {report}')
if errors:
    print('DRC errors:', dict(Counter(item['type'] for item in errors)))
sys.exit(2 if missing or errors else 0)
