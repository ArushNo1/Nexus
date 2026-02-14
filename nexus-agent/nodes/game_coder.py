"""Node 3 - Game Coder & Documentor: Writes the Kaplay.js game code with documentation."""

from langchain_core.messages import SystemMessage, HumanMessage, AIMessage, ToolMessage

from state import AgentState
from utils.llm import get_llm, extract_text
from utils.logger import get_logger
from utils.debug import dump_debug_state
from utils.prompts import load_prompt, render_template
from tools.kaplay_docs_rag import search_kaplay_docs

log = get_logger("game_coder")

TOOLS = [search_kaplay_docs]
TOOLS_BY_NAME = {t.name: t for t in TOOLS}
MAX_TOOL_ROUNDS = 5


async def game_coder_node(state: AgentState) -> dict:
    """Generate a complete, single-file Kaplay.js HTML game from the GDD.

    If in a fix loop (code_iteration > 0), includes the playtest error log
    and report as revision context.

    The LLM can call the search_kaplay_docs tool to look up Kaplay.js API
    references while writing or revising code.
    """
    is_revision = state["code_iteration"] > 0
    mode = "revision" if is_revision else "initial"
    log.info(f"[bold green]Node 3 — Game Coder[/bold green] | status: {state.get('status')} | mode: {mode} | code iteration: {state['code_iteration'] + 1}")

    system = load_prompt("coder_system.md")

    context = {
        "game_design_doc": state["game_design_doc"],
        "game_type": state["game_type"],
        "template_code": state["template_code"],
        "implementation_plan": state.get("implementation_plan") or "",
        "existing_code": state.get("game_code") or "",
        "playtest_report": state.get("playtest_report") or "",
        "errors": "\n".join(state.get("errors", [])),
        "is_revision": state["code_iteration"] > 0,
    }
    user = render_template("coder_user.md", context)

    llm = get_llm("game_coder").bind_tools(TOOLS)

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
            log.info(f"[green]  ↳ tool call:[/green] {call['name']}({call['args']})")
            output = await tool_fn.ainvoke(call["args"])
            messages.append(ToolMessage(content=str(output), tool_call_id=call["id"]))

    code = extract_text(response.content)
    # Extract HTML if wrapped in markdown code fences
    if "```html" in code:
        code = code.split("```html", 1)[1].rsplit("```", 1)[0].strip()
    elif "```" in code:
        code = code.split("```", 1)[1].rsplit("```", 1)[0].strip()

    result = {
        "game_code": code,
        "documentation": code,
        "status": "generating_assets",
    }

    log.info(f"[bold green]Node 3 — Game Coder[/bold green] | done → generated {len(code)} chars | status: generating_assets")
    dump_debug_state("game_coder", {**state, **result})

    return result
