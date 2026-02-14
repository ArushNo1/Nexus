"""Node 1 - Game Planner: Translates a lesson plan into a Game Design Document."""

import json

from langchain_core.messages import SystemMessage, HumanMessage

from state import AgentState
from utils.llm import get_llm
from utils.prompts import load_prompt, render_template


async def game_planner_node(state: AgentState) -> dict:
    """Convert the lesson plan into a structured Game Design Document (GDD).

    If design_feedback exists from a prior evaluator loop, it is included
    as revision instructions for the LLM.
    """
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

    return {
        "game_design_doc": response.content,
        "status": "evaluating",
    }
