"""CLI entry point: load JSON lesson plan → run graph → save HTML output."""

import argparse
import asyncio
import json
import sys
from pathlib import Path

from rich.console import Console
from rich.panel import Panel

from graph import build_graph
from state import AgentState

console = Console()


def load_lesson_plan(path: str) -> dict:
    """Load and validate a JSON lesson plan from disk."""
    filepath = Path(path)
    if not filepath.exists():
        console.print(f"[red]Error:[/red] File not found: {filepath}")
        sys.exit(1)
    if not filepath.suffix == ".json":
        console.print(f"[red]Error:[/red] Expected a .json file, got: {filepath.suffix}")
        sys.exit(1)
    with open(filepath) as f:
        return json.load(f)


def save_output(phaser_code: str, title: str, output_dir: str = "output") -> Path:
    """Save the generated HTML game to the output directory."""
    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=True)
    slug = title.lower().replace(" ", "_").replace("-", "_")
    filename = out / f"{slug}_game.html"
    filename.write_text(phaser_code)
    return filename


async def run(input_path: str, verbose: bool = False) -> None:
    """Load a lesson plan, run the agent graph, and save the result."""
    lesson_plan = load_lesson_plan(input_path)
    title = lesson_plan.get("title", "untitled")

    console.print(Panel(f"[bold]Generating Phaser game for:[/bold] {title}", style="cyan"))

    initial_state: AgentState = {
        "lesson_plan": lesson_plan,
        "game_design_doc": "",
        "design_feedback": "",
        "design_approved": False,
        "phaser_code": "",
        "documentation": "",
        "assets": {},
        "assets_embedded": False,
        "playtest_report": "",
        "ship_approved": False,
        "errors": [],
        "design_iteration": 0,
        "code_iteration": 0,
        "status": "planning",
    }

    graph = build_graph()
    final_state = await graph.ainvoke(initial_state)

    if final_state.get("phaser_code"):
        output_path = save_output(final_state["phaser_code"], title)
        console.print(f"\n[green]Game saved to:[/green] {output_path}")
    else:
        console.print("\n[red]No game code was generated.[/red]")
        sys.exit(1)

    if final_state.get("errors"):
        console.print("\n[yellow]Warnings/Errors encountered:[/yellow]")
        for err in final_state["errors"]:
            console.print(f"  - {err}")

    console.print(f"\n[bold]Final status:[/bold] {final_state.get('status', 'unknown')}")


def main():
    parser = argparse.ArgumentParser(description="Generate a Phaser 3 game from a lesson plan")
    parser.add_argument("--input", "-i", required=True, help="Path to JSON lesson plan file")
    parser.add_argument("--verbose", "-v", action="store_true", help="Enable verbose logging")
    args = parser.parse_args()

    asyncio.run(run(args.input, args.verbose))


if __name__ == "__main__":
    main()
