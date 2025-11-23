#!/usr/bin/env python3
import re
import os
from pathlib import Path

# Find all schema files
schema_files = list(Path('/home/user/sass-elearning-monorepo/backend/src/modules').rglob('*.schema.ts'))

for schema_file in schema_files:
    print(f"Processing {schema_file}...")

    with open(schema_file, 'r') as f:
        content = f.read()

    original_content = content

    # Pattern 1: @Prop({ default: null }) followed by fieldname: string | null
    content = re.sub(
        r'@Prop\(\{\s*default:\s*null\s*\}\)\s*\n(\s+)(\w+):\s*string\s*\|\s*null;',
        r'@Prop({ type: String, default: null })\n\1\2: string | null;',
        content
    )

    # Pattern 2: @Prop({ default: null }) followed by fieldname: number | null
    content = re.sub(
        r'@Prop\(\{\s*default:\s*null\s*\}\)\s*\n(\s+)(\w+):\s*number\s*\|\s*null;',
        r'@Prop({ type: Number, default: null })\n\1\2: number | null;',
        content
    )

    # Pattern 3: @Prop({ default: null }) followed by fieldname: Date | null
    content = re.sub(
        r'@Prop\(\{\s*default:\s*null\s*\}\)\s*\n(\s+)(\w+):\s*Date\s*\|\s*null;',
        r'@Prop({ type: Date, default: null })\n\1\2: Date | null;',
        content
    )

    # Pattern 4: @Prop({ trim: true, default: null }) - already has trim
    content = re.sub(
        r'@Prop\(\{\s*trim:\s*true,\s*default:\s*null\s*\}\)\s*\n(\s+)(\w+):\s*string\s*\|\s*null;',
        r'@Prop({ type: String, trim: true, default: null })\n\1\2: string | null;',
        content
    )

    if content != original_content:
        with open(schema_file, 'w') as f:
            f.write(content)
        print(f"  ✓ Updated {schema_file}")
    else:
        print(f"  - No changes needed")

print("\nAll schemas processed!")
