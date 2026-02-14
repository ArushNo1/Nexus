"""Node 4 - Asset Generator: Creates or sources visual/audio assets and embeds them."""

from langchain_core.messages import SystemMessage, HumanMessage

from state import AgentState
from utils.llm import get_llm
from utils.logger import get_logger
from utils.prompts import load_prompt, render_template

log = get_logger("asset_generator")


async def asset_generator_node(state: AgentState) -> dict:
    """Generate placeholder assets and embed them into the Phaser code.

    Currently uses colored-rectangle placeholders with text labels.
    Future: integrate DALL-E / Stable Diffusion for real sprite generation.
    """
    log.info(f"[bold magenta]Node 4 — Asset Generator[/bold magenta] | status: {state.get('status')} | input code: {len(state.get('phaser_code', ''))} chars")

    system = load_prompt("asset_system.md")
    user = render_template("asset_user.md", {
        "game_design_doc": state["game_design_doc"],
        "phaser_code": state["phaser_code"],
    })

    llm = get_llm("asset_generator")
    response = await llm.ainvoke([
        SystemMessage(content=system),
        HumanMessage(content=user),
    ])

    updated_code = response.content
    if "```html" in updated_code:
        updated_code = updated_code.split("```html", 1)[1].rsplit("```", 1)[0].strip()
    elif "```" in updated_code:
        updated_code = updated_code.split("```", 1)[1].rsplit("```", 1)[0].strip()

    log.info(f"[bold magenta]Node 4 — Asset Generator[/bold magenta] | done → output code: {len(updated_code)} chars | status: playtesting")

    return {
        "phaser_code": updated_code,
        "assets": {"sprites": [], "backgrounds": [], "sounds": []},
        "assets_embedded": True,
        "status": "playtesting",
    }
