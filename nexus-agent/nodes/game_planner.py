"""Node 1 - Game Planner: Selects a game template and designs an addon feature for the lesson."""

import json
import re
from pathlib import Path

from langchain_core.messages import SystemMessage, HumanMessage

from state import AgentState
from utils.llm import get_llm, extract_text
from utils.logger import get_logger
from utils.debug import dump_debug_state
from utils.prompts import load_prompt, render_template

log = get_logger("game_planner")

VALID_GAME_TYPES = {"beatemup", "fighter", "maze", "platformer", "shootemup"}
TEMPLATES_DIR = Path(__file__).parent.parent / "templates"


def _parse_game_type(content: str) -> str:
    """Extract game type from LLM response. Falls back to 'platformer'."""
    match = re.search(r"GAME_TYPE:\s*(\w+)", content, re.IGNORECASE)
    if match:
        game_type = match.group(1).strip().lower()
        if game_type in VALID_GAME_TYPES:
            return game_type
    # Fallback: check if any valid type appears prominently
    for gt in VALID_GAME_TYPES:
        if gt in content.lower():
            return gt
    return "platformer"


def _load_template(game_type: str) -> str:
    """Load the HTML template for the given game type."""
    template_path = TEMPLATES_DIR / f"{game_type}.html"
    return template_path.read_text()


async def game_planner_node(state: AgentState) -> dict:
    """Select the best game template and design an addon feature for the lesson.

    If design_feedback exists from a prior evaluator loop, it is included
    as revision instructions for the LLM.
    """
    iteration = state.get("design_iteration", 0) + 1
    log.info(f"[bold cyan]Node 1 — Game Planner[/bold cyan] | status: {state.get('status')} | design iteration: {iteration}")

    system = load_prompt("planner_system.md")
    user = render_template("planner_user.md", {
        "lesson_plan": json.dumps(state["lesson_plan"], indent=2),
        "prior_feedback": state.get("design_feedback") or "None — first iteration",
    })

    llm = get_llm("game_planner")
    response = await llm.ainvoke([
        SystemMessage(content=system),
        HumanMessage(content=user),
    ])

    content = extract_text(response.content)

    game_type = _parse_game_type(content)
    template_code = _load_template(game_type)

    result = {
        "game_type": game_type,
        "template_code": template_code,
        "game_design_doc": content,
        "status": "evaluating",
    }

    log.info(f"[bold cyan]Node 1 — Game Planner[/bold cyan] | selected: {game_type} | done → status: evaluating")
    dump_debug_state("game_planner", {**state, **result})

    return result
