#!/usr/bin/env bash
# Removes inline ```plantuml ... ``` code blocks from design.md files,
# keeping the ![...](....png) image references that follow them.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SDD_DIR="$REPO_ROOT/docs/software-design-documents"

process_file() {
    local md_file="$1"
    local dir
    dir="$(dirname "$md_file")"
    local feature_dir
    feature_dir="$(basename "$dir")"

    echo "Processing: $feature_dir/design.md"

    local tmp_file
    tmp_file="$(mktemp)"
    local in_plantuml=false
    local removed=0

    while IFS= read -r line || [ -n "$line" ]; do
        # Strip trailing carriage return
        line="${line%$'\r'}"

        if [[ "$line" == '```plantuml' ]]; then
            in_plantuml=true
            removed=$((removed + 1))
            continue
        fi

        if $in_plantuml; then
            if [[ "$line" == '```' ]]; then
                in_plantuml=false
                # Skip the blank line between closing fence and image ref
                continue
            fi
            # Skip all lines inside the plantuml block
            continue
        fi

        printf '%s\r\n' "$line" >> "$tmp_file"
    done < "$md_file"

    mv "$tmp_file" "$md_file"
    echo "  Removed $removed plantuml block(s)"
}

# --- Collect files ---
files=()
if [ $# -gt 0 ]; then
    files=("$@")
else
    for d in "$SDD_DIR"/*/design.md; do
        [ -f "$d" ] && files+=("$d")
    done
fi

if [ ${#files[@]} -eq 0 ]; then
    echo "No design.md files found."
    exit 0
fi

for f in "${files[@]}"; do
    process_file "$f"
done

echo ""
echo "Done. Inline PlantUML blocks removed; image references preserved."
