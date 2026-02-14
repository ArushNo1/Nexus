"""Node 2.5 - Implementation Planner: Creates a detailed todo list and implementation roadmap from the approved GDD."""

import json

from langchain_core.messages import SystemMessage, HumanMessage, AIMessage, ToolMessage

from state import AgentState
from utils.llm import get_llm
from utils.logger import get_logger
from utils.debug import dump_debug_state
from utils.prompts import load_prompt, render_template
from tools.kaplay_docs_rag import search_kaplay_docs

log = get_logger("implementation_planner")

TOOLS = [search_kaplay_docs]
TOOLS_BY_NAME = {t.name: t for t in TOOLS}
MAX_TOOL_ROUNDS = 5


async def implementation_planner_node(state: AgentState) -> dict:
    """Break the approved GDD into a structured implementation plan with prioritized tasks.

    Produces a detailed, ordered todo list covering scene setup, mechanics,
    learning hooks, assets, UI, and polish — giving the coder node a clear
    step-by-step roadmap to follow.

    The LLM can call the search_kaplay_docs tool to look up Kaplay.js API
    references while building the plan.
    """
    log.info("[bold magenta]Node 2.5 — Implementation Planner[/bold magenta] | creating implementation roadmap")

    system = load_prompt("impl_planner_system.md")
    user = render_template("impl_planner_user.md", {
        "lesson_plan": json.dumps(state["lesson_plan"], indent=2),
        "game_design_doc": state["game_design_doc"],
    })

    llm = get_llm("implementation_planner").bind_tools(TOOLS)

    messages = [
        SystemMessage(content=system),
        HumanMessage(content=user),
    ]

    # Agentic tool-calling loop: let the LLM call tools until it produces a final text response
    for _ in range(MAX_TOOL_ROUNDS):
        response: AIMessage = await llm.ainvoke(messages)
        messages.append(response)

        if not response.tool_calls:
            break

        for call in response.tool_calls:
            tool_fn = TOOLS_BY_NAME[call["name"]]
            log.info(f"[magenta]  ↳ tool call:[/magenta] {call['name']}({call['args']})")
            output = await tool_fn.ainvoke(call["args"])
            messages.append(ToolMessage(content=str(output), tool_call_id=call["id"]))

    result = {
        "implementation_plan": response.content,
        "status": "coding",
    }

    log.info("[bold magenta]Node 2.5 — Implementation Planner[/bold magenta] | done → status: coding")
    dump_debug_state("implementation_planner", {**state, **result})

    return result
