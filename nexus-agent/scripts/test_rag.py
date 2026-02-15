"""Quick tester for the search_kaplay_docs tool. Writes full output to a file."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from tools.kaplay_docs_rag import search_kaplay_docs

SAMPLE_QUERIES = [
    "how to add a sprite",
    "tween animation",
    "area component collision",
    "camera position and zoom",
    "playing sounds and music",
]

OUTPUT_FILE = Path(__file__).resolve().parent.parent / "output" / ".debug" / "rag_test_output.md"


def main():
    queries = [" ".join(sys.argv[1:])] if len(sys.argv) > 1 else SAMPLE_QUERIES

    lines = []
    for q in queries:
        print(f"Querying: {q}")
        result = search_kaplay_docs.invoke(q)
        lines.append(f"# Query: {q}\n\n{result}\n\n")

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text("\n".join(lines))
    print(f"\nFull output written to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
