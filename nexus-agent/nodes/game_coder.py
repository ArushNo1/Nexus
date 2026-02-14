"""Node 3 - Game Coder & Documentor: Writes the Phaser 3 game code with documentation."""

from langchain_core.messages import SystemMessage, HumanMessage

from state import AgentState
from utils.llm import get_llm
from utils.logger import get_logger
from utils.prompts import load_prompt, render_template

log = get_logger("game_coder")


async def game_coder_node(state: AgentState) -> dict:
    """Generate a complete, single-file Phaser 3 HTML game from the GDD.

    If in a fix loop (code_iteration > 0), includes the playtest error log
    and report as revision context.
    """
    is_revision = state["code_iteration"] > 0
    mode = "revision" if is_revision else "initial"
    log.info(f"[bold green]Node 3 — Game Coder[/bold green] | status: {state.get('status')} | mode: {mode} | code iteration: {state['code_iteration'] + 1}")

    system = load_prompt("coder_system.md")

    context = {
        "game_design_doc": state["game_design_doc"],
        "existing_code": state.get("phaser_code") or "",
        "playtest_report": state.get("playtest_report") or "",
        "errors": "\n".join(state.get("errors", [])),
        "is_revision": state["code_iteration"] > 0,
    }
    user = render_template("coder_user.md", context)

    llm = get_llm("game_coder")
    response = await llm.ainvoke([
        SystemMessage(content=system),
        HumanMessage(content=user),
    ])

    code = response.content
    # Extract HTML if wrapped in markdown code fences
    if "```html" in code:
        code = code.split("```html", 1)[1].rsplit("```", 1)[0].strip()
    elif "```" in code:
        code = code.split("```", 1)[1].rsplit("```", 1)[0].strip()

    log.info(f"[bold green]Node 3 — Game Coder[/bold green] | done → generated {len(code)} chars | status: generating_assets")

    return {
        "phaser_code": code,
        "documentation": code,  # Documentation is inline within the HTML
        "status": "generating_assets",
    }
