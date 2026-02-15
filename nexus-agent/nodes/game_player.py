"""Node 5 - Game Player & Final Evaluator: Tests and evaluates the generated game."""

import json

from langchain_core.messages import SystemMessage, HumanMessage

from state import AgentState
from utils.llm import get_llm, extract_text
from utils.logger import get_logger
from utils.debug import dump_debug_state
from utils.prompts import load_prompt, render_template
from tools.puppeteer_runner import run_game_headless

log = get_logger("game_player")


async def game_player_node(state: AgentState) -> dict:
    """Run the game in a headless browser to catch real errors, then
    pass those results to the LLM for a final evaluation.
    """
    log.info(f"[bold red]Node 5 — Game Player[/bold red] | status: {state.get('status')} | code iteration: {state['code_iteration'] + 1}")

    # ── Step 1: Headless browser playtest ──
    log.info("[bold red]Node 5 — Game Player[/bold red] | running headless browser playtest...")
    playtest = await run_game_headless(state["game_code"])

    runtime_errors = playtest.errors
    runtime_summary = playtest.summary

    log.info(f"[bold red]Node 5 — Game Player[/bold red] | browser: {len(runtime_errors)} errors, {len(playtest.console_warnings)} warnings")

    # ── Step 2: LLM evaluation with runtime results ──
    system = load_prompt("player_system.md")
    user = render_template("player_user.md", {
        "game_code": state["game_code"],
        "game_design_doc": state["game_design_doc"],
        "lesson_plan": json.dumps(state["lesson_plan"], indent=2),
        "runtime_results": runtime_summary,
    })

    llm = get_llm("game_player")
    response = await llm.ainvoke([
        SystemMessage(content=system),
        HumanMessage(content=user),
    ])

    content = extract_text(response.content)

    # If browser caught real errors, those always count
    errors = list(runtime_errors)

    # Also extract any LLM-reported errors
    if "ERRORS:" in content.upper():
        error_section = content.upper().split("ERRORS:")[-1].split("\n\n")[0]
        llm_errors = [line.strip("- ").strip() for line in error_section.strip().split("\n") if line.strip()]
        errors.extend(llm_errors)

    # Ship only if no runtime errors and LLM says SHIP
    approved = len(runtime_errors) == 0 and "SHIP" in content.upper()

    result = {
        "playtest_report": content,
        "ship_approved": approved,
        "errors": errors,
        "code_iteration": state["code_iteration"] + 1,
        "status": "done" if approved else "coding",
    }

    verdict = "SHIP" if approved else "FIX"
    log.info(f"[bold red]Node 5 — Game Player[/bold red] | done → verdict: {verdict} | runtime errors: {len(runtime_errors)} | total errors: {len(errors)}")
    dump_debug_state("game_player", {**state, **result})

    return result
