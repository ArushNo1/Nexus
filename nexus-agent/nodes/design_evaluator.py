"""Node 2 - Design Evaluator: Quality-gates the GDD before code generation."""

import json

from langchain_core.messages import SystemMessage, HumanMessage

from state import AgentState
from utils.llm import get_llm, extract_text
from utils.logger import get_logger
from utils.debug import dump_debug_state
from utils.prompts import load_prompt, render_template
from utils.supabase import update_game

log = get_logger("design_evaluator")


async def design_evaluator_node(state: AgentState) -> dict:
    """Evaluate the GDD against a rubric and decide PASS or REVISE.

    Scores on: pedagogical alignment, fun factor, Kaplay feasibility,
    scope control, and accessibility. Passes if all >= 3 and avg >= 3.5.
    """
    log.info(f"[bold yellow]Node 2 — Design Evaluator[/bold yellow] | status: {state.get('status')} | iteration: {state['design_iteration'] + 1}")

    system = load_prompt("evaluator_system.md")
    rubric = load_prompt("evaluator_rubric.md")
    user = render_template("evaluator_user.md", {
        "game_design_doc": state["game_design_doc"],
        "lesson_plan": json.dumps(state["lesson_plan"], indent=2),
        "rubric": rubric,
    })

    llm = get_llm("design_evaluator")
    response = await llm.ainvoke([
        SystemMessage(content=system),
        HumanMessage(content=user),
    ])

    content = extract_text(response.content)
    approved = "PASS" in content.upper().split("DECISION")[-1] if "DECISION" in content.upper() else "PASS" in content.upper()

    result = {
        "design_feedback": content,
        "design_approved": approved,
        "design_iteration": state["design_iteration"] + 1,
    }

    verdict = "PASS" if approved else "REVISE"
    log.info(f"[bold yellow]Node 2 — Design Evaluator[/bold yellow] | done → verdict: {verdict}")
    dump_debug_state("design_evaluator", {**state, **result})

    # Push status to Supabase
    game_id = state.get("game_id")
    if game_id:
        status = "implementation_planning" if approved else "evaluating"
        update_game(game_id, {"status": status})

    return result
