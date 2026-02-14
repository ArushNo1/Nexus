"""Debug state dumper — writes agent state snapshots to output/.debug/."""

import json
from pathlib import Path

DEBUG_DIR = Path("output/.debug")

# Fields to extract as standalone markdown files instead of JSON strings
MARKDOWN_FIELDS = {
    "game_planner": "game_design_doc",
    "design_evaluator": "design_feedback",
    "implementation_planner": "implementation_plan",
}


def dump_debug_state(node_name: str, state: dict) -> None:
    """Write the current agent state to output/.debug/.

    For game_planner and design_evaluator, the main text output is written
    as a readable .md file. All other nodes get a JSON snapshot.
    """
    DEBUG_DIR.mkdir(parents=True, exist_ok=True)

    iteration = state.get("design_iteration", 0) + state.get("code_iteration", 0)

    md_field = MARKDOWN_FIELDS.get(node_name)
    if md_field and state.get(md_field):
        md_path = DEBUG_DIR / f"{node_name}_{iteration}.md"
        md_path.write_text(state[md_field])
    else:
        filename = DEBUG_DIR / f"{node_name}_{iteration}.json"

        snapshot = {}
        for key, value in state.items():
            if isinstance(value, str) and len(value) > 2000:
                snapshot[key] = value[:2000] + f"\n... [truncated, {len(value)} chars total]"
            else:
                snapshot[key] = value

        filename.write_text(json.dumps(snapshot, indent=2, default=str))
