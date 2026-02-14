"""Node 2 - Design Evaluator: Quality-gates the GDD before code generation."""

import json

from langchain_core.messages import SystemMessage, HumanMessage

from state import AgentState
from utils.llm import get_llm
from utils.prompts import load_prompt, render_template


async def design_evaluator_node(state: AgentState) -> dict:
    """Evaluate the GDD against a rubric and decide PASS or REVISE.

    Scores on: pedagogical alignment, fun factor, Phaser feasibility,
    scope control, and accessibility. Passes if all >= 3 and avg >= 3.5.
    """
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

    content = response.content
    approved = "PASS" in content.upper().split("DECISION")[-1] if "DECISION" in content.upper() else "PASS" in content.upper()

    return {
        "design_feedback": content,
        "design_approved": approved,
        "design_iteration": state["design_iteration"] + 1,
    }
