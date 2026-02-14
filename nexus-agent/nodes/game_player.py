"""Node 5 - Game Player & Final Evaluator: Tests and evaluates the generated game."""

import json

from langchain_core.messages import SystemMessage, HumanMessage

from state import AgentState
from utils.llm import get_llm
from utils.prompts import load_prompt, render_template


async def game_player_node(state: AgentState) -> dict:
    """Evaluate the final game code via static analysis and LLM review.

    Checks: HTML validity, Phaser CDN presence, JS structure, and
    whether the game matches the GDD and lesson objectives.

    Future: integrate Puppeteer for headless browser runtime testing.
    """
    system = load_prompt("player_system.md")
    user = render_template("player_user.md", {
        "phaser_code": state["phaser_code"],
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

    return {
        "playtest_report": content,
        "ship_approved": approved,
        "errors": errors,
        "code_iteration": state["code_iteration"] + 1,
        "status": "done" if approved else "coding",
    }
