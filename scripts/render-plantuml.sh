#!/usr/bin/env bash
# Renders all .puml files to .png using PlantUML.
# Usage:
#   ./scripts/render-plantuml.sh              # render all .puml files in the repo
#   ./scripts/render-plantuml.sh file1.puml file2.puml  # render specific files
#
# Requires: Java runtime + plantuml.jar (set PLANTUML_JAR env var)
#   OR: Docker with plantuml/plantuml image
#   OR: plantuml CLI on PATH

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# --- Locate PlantUML renderer ---
render_puml() {
    local input_file="$1"
    local output_dir
    output_dir="$(dirname "$input_file")"

    if command -v plantuml &>/dev/null; then
        plantuml -tpng -o "$output_dir" "$input_file"
    elif [ -n "${PLANTUML_JAR:-}" ] && [ -f "$PLANTUML_JAR" ]; then
        java -jar "$PLANTUML_JAR" -tpng -o "$output_dir" "$input_file"
    elif command -v docker &>/dev/null; then
        local abs_dir
        abs_dir="$(cd "$output_dir" && pwd)"
        local filename
        filename="$(basename "$input_file")"
        docker run --rm -v "$abs_dir:/data" plantuml/plantuml -tpng "/data/$filename"
    else
        echo "ERROR: No PlantUML renderer found." >&2
        echo "  Install one of:" >&2
        echo "    - plantuml CLI (e.g., 'choco install plantuml' or 'brew install plantuml')" >&2
        echo "    - Set PLANTUML_JAR=/path/to/plantuml.jar (requires Java)" >&2
        echo "    - Install Docker (will use plantuml/plantuml image)" >&2
        return 1
    fi
}

# --- Collect files to render ---
files=()
if [ $# -gt 0 ]; then
    files=("$@")
else
    while IFS= read -r -d '' f; do
        files+=("$f")
    done < <(find "$REPO_ROOT" -name '*.puml' -print0)
fi

if [ ${#files[@]} -eq 0 ]; then
    echo "No .puml files found."
    exit 0
fi

echo "Rendering ${#files[@]} PlantUML file(s)..."
errors=0
for f in "${files[@]}"; do
    echo "  -> $(basename "$f")"
    if ! render_puml "$f"; then
        echo "  FAILED: $f" >&2
        ((errors++))
    fi
done

if [ "$errors" -gt 0 ]; then
    echo "WARNING: $errors file(s) failed to render." >&2
    exit 1
fi

echo "Done."
