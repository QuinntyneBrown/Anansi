#!/usr/bin/env bash
# Extracts inline PlantUML blocks from design.md files into separate .puml files
# and updates the markdown to include image references to the rendered PNGs.
#
# Usage: ./eng/scripts/extract-plantuml-from-sdd.sh [design.md ...]
#   No args = process all docs/software-design-documents/*/design.md

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
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
    local block_index=0
    local in_plantuml=false
    local puml_content=""
    local heading_name=""
    local last_heading=""

    while IFS= read -r line || [ -n "$line" ]; do
        # Strip trailing carriage return (Windows line endings)
        line="${line%$'\r'}"

        # Track the last heading seen (for naming .puml files)
        if [[ "$line" =~ ^###?#?[[:space:]]+(.*) ]]; then
            last_heading="${BASH_REMATCH[1]}"
        fi

        if [[ "$line" == '```plantuml' ]]; then
            in_plantuml=true
            puml_content=""
            heading_name="$last_heading"
            printf '%s\r\n' "$line" >> "$tmp_file"
            continue
        fi

        if $in_plantuml; then
            if [[ "$line" == '```' ]]; then
                in_plantuml=false
                block_index=$((block_index + 1))

                # Generate a slug from the heading
                local slug
                slug=$(echo "$heading_name" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//')
                [ -z "$slug" ] && slug="diagram-$block_index"

                local puml_filename="${slug}.puml"
                local png_filename="${slug}.png"

                # Write the .puml file
                printf '%s' "$puml_content" > "$dir/$puml_filename"

                # Write the closing fence and add image reference
                printf '%s\r\n' "$line" >> "$tmp_file"
                printf '\r\n' >> "$tmp_file"
                printf '![%s](%s)\r\n' "$heading_name" "$png_filename" >> "$tmp_file"
            else
                puml_content+="$line"$'\n'
                printf '%s\r\n' "$line" >> "$tmp_file"
            fi
            continue
        fi

        printf '%s\r\n' "$line" >> "$tmp_file"
    done < "$md_file"

    # Replace original file
    mv "$tmp_file" "$md_file"
    echo "  Extracted $block_index PlantUML block(s)"
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
echo "Extraction complete. Run 'eng/scripts/render-plantuml.sh' to generate PNG images."
echo "Configure git hooks: git config core.hooksPath .githooks"
