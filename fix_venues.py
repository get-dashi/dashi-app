#!/usr/bin/env python3
"""Apply targeted photo ID replacements to venues.ts"""

import re

REPLACEMENTS = {
    "feat-4":   ("1504674900247-0877df9cc836", "1528605248644-14bb8db8e01b"),
    "feat-62":  ("1565299585323-38d6b0865b47", "1514362545857-3bc16c4c7d1b"),
    "feat-82":  ("1504674900247-0877df9cc836", "1414235077428-338989a2e8c0"),
    "feat-100": ("1514362545857-3bc16c4c7d1b", "1504275107627-0c2ba7a43dba"),
    "feat-105": ("1559329007-40df8a9345d8",    "1552566626-52f8b828329d"),
    "atl-020":  ("1414235077428-338989a2e8c0", "1544025162-d76538de3669"),
    "atl-021":  ("1414235077428-338989a2e8c0", "1504674900247-0877df9cc836"),
    "atl-029":  ("1414235077428-338989a2e8c0", "1484980859-8c9016a97f8a"),
    "atl-035":  ("1510812431401-41d2bd2722f3", "1535400255680-ccd67b4c8d38"),
    "nyc-004":  ("1414235077428-338989a2e8c0", "1617196034183-421b4040ed20"),
    "nyc-011":  ("1414235077428-338989a2e8c0", "1565557038117-ddc4e8c8cb29"),
    "nyc-017":  ("1495474472287-4d71bcdd2085", "1544025162-d76538de3669"),
    "nyc-035":  ("1495474472287-4d71bcdd2085", "1504674900247-0877df9cc836"),
    "nyc-044":  ("1559339352-11d035aa65de",    "1473093226795-f7e8b95e4a85"),
    "mia-015":  ("1514362545857-3bc16c4c7d1b", "1566417088-c5f27cfc1b7a"),
    "mia-016":  ("1510812431401-41d2bd2722f3", "1514362545857-3bc16c4c7d1b"),
    "dal-002":  ("1559339352-11d035aa65de",    "1484980859-8c9016a97f8a"),
    "dal-004":  ("1559339352-11d035aa65de",    "1582012258839-71f0db5dfbcc"),
    "dal-005":  ("1559339352-11d035aa65de",    "1559329007-40df8a9345d8"),
    "dal-006":  ("1559339352-11d035aa65de",    "1626808642154-c3e5e8ee3e26"),
    "dal-016":  ("1510812431401-41d2bd2722f3", "1551024709-8f23befc6f87"),
    "dal-018":  ("1514362545857-3bc16c4c7d1b", "1566417088-c5f27cfc1b7a"),
}

# NYC bar cluster: nyc-020 through nyc-027 using 1510812431401-41d2bd2722f3
# cycle through three IDs
NYC_BAR_CYCLE = [
    "1514362545857-3bc16c4c7d1b",
    "1551024709-8f23befc6f87",
    "1571167073893-f8fad0e45651",
]
NYC_BAR_IDS = ["nyc-020", "nyc-021", "nyc-022", "nyc-023", "nyc-024", "nyc-025", "nyc-026", "nyc-027"]
for i, vid in enumerate(NYC_BAR_IDS):
    REPLACEMENTS[vid] = ("1510812431401-41d2bd2722f3", NYC_BAR_CYCLE[i % 3])

FILEPATH = "/Users/ricky/Desktop/dashi-nextjs/lib/venues.ts"

with open(FILEPATH, "r") as f:
    lines = f.readlines()

changes_made = {}
for i, line in enumerate(lines):
    # detect venue id on this line
    m = re.search(r"id:'([^']+)'", line)
    if not m:
        continue
    vid = m.group(1)
    if vid not in REPLACEMENTS:
        continue
    old_id, new_id = REPLACEMENTS[vid]
    old_url = f"photo-{old_id}?"
    new_url = f"photo-{new_id}?"
    if old_url in line:
        lines[i] = line.replace(old_url, new_url, 1)
        changes_made[vid] = (old_id, new_id)
        print(f"✓ {vid}: {old_id} → {new_id}")
    else:
        # check if already updated or wrong assumption
        print(f"✗ {vid}: photo ID '{old_id}' not found in line {i+1}")
        print(f"  Line: {line.rstrip()[:120]}")

with open(FILEPATH, "w") as f:
    f.writelines(lines)

print(f"\nDone. Changed {len(changes_made)}/{len(REPLACEMENTS)} venues.")
