"""Node 2.5 - Implementation Planner: Creates a detailed todo list and implementation roadmap from the approved GDD."""

import json

from langchain_core.messages import SystemMessage, HumanMessage

from state import AgentState
from utils.llm import get_llm
from utils.logger import get_logger
from utils.debug import dump_debug_state
from utils.prompts import load_prompt, render_template

log = get_logger("implementation_planner")


async def implementation_planner_node(state: AgentState) -> dict:
    """Break the approved GDD into a structured implementation plan with prioritized tasks.

    Produces a detailed, ordered todo list covering scene setup, mechanics,
    learning hooks, assets, UI, and polish — giving the coder node a clear
    step-by-step roadmap to follow.
    """
    log.info("[bold magenta]Node 2.5 — Implementation Planner[/bold magenta] | creating implementation roadmap")

    system = load_prompt("impl_planner_system.md")
    user = render_template("impl_planner_user.md", {
        "lesson_plan": json.dumps(state["lesson_plan"], indent=2),
        "game_design_doc": state["game_design_doc"],
    })

    llm = get_llm("implementation_planner")
    response = await llm.ainvoke([
        SystemMessage(content=system),
        HumanMessage(content=user),
    ])

    result = {
        "implementation_plan": response.content,
        "status": "coding",
    }

    log.info("[bold magenta]Node 2.5 — Implementation Planner[/bold magenta] | done → status: coding")
    dump_debug_state("implementation_planner", {**state, **result})

    return result
