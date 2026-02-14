"""Node 5 - Game Player & Final Evaluator: Tests and evaluates the generated game."""

import json

from langchain_core.messages import SystemMessage, HumanMessage

from state import AgentState
from utils.llm import get_llm
from utils.logger import get_logger
from utils.debug import dump_debug_state
from utils.prompts import load_prompt, render_template

log = get_logger("game_player")


async def game_player_node(state: AgentState) -> dict:
    """Evaluate the final game code via static analysis and LLM review.

    Checks: HTML validity, Kaplay CDN presence, JS structure, and
    whether the game matches the GDD and lesson objectives.

    Future: integrate Puppeteer for headless browser runtime testing.
    """
    log.info(f"[bold red]Node 5 — Game Player[/bold red] | status: {state.get('status')} | code iteration: {state['code_iteration'] + 1}")

    system = load_prompt("player_system.md")
    user = render_template("player_user.md", {
        "game_code": state["game_code"],
        "game_design_doc": state["game_design_doc"],
        "lesson_plan": json.dumps(state["lesson_plan"], indent=2),
    })

    llm = get_llm("game_player")
    response = await llm.ainvoke([
        SystemMessage(content=system),
        HumanMessage(content=user),
    ])

    content = response.content
    approved = "SHIP" in content.upper()
    errors = []

    # Extract errors section if present
    if "ERRORS:" in content.upper():
        error_section = content.upper().split("ERRORS:")[-1].split("\n\n")[0]
        errors = [line.strip("- ").strip() for line in error_section.strip().split("\n") if line.strip()]

    result = {
        "playtest_report": content,
        "ship_approved": approved,
        "errors": errors,
        "code_iteration": state["code_iteration"] + 1,
        "status": "done" if approved else "coding",
    }

    verdict = "SHIP" if approved else "FIX"
    error_count = len(errors)
    log.info(f"[bold red]Node 5 — Game Player[/bold red] | done → verdict: {verdict} | errors: {error_count}")
    dump_debug_state("game_player", {**state, **result})

    return result
