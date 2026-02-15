import asyncio
import sys
from pathlib import Path
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage, ToolMessage

# Add project root to path
ROOT_DIR = Path(__file__).parent.parent
sys.path.append(str(ROOT_DIR))

from utils.llm import get_llm, extract_text
from tools.kaplay_docs_rag import search_kaplay_docs

TEMPLATE_PATH = ROOT_DIR / "templates/platformer.html"
DESIGN_DOC_PATH = ROOT_DIR / "output/untitled_design.md"
OUTPUT_PATH = ROOT_DIR / "output/untitled_game_with_tutorial.html"

SYSTEM_PROMPT = """You are an expert Kaplay.js game developer. You modify existing game templates to create educational games.

## Your Job

You receive a base game template (working HTML game) and a design document.
You must:
1. Reskin the visuals to match the lesson topic (1860s Civil War theme).
2. Implement the "Fact-Check Bridge" addon mechanic described in the design.
3. **CRITICAL REQUIREMENT**: Implement a dedicated `scene("tutorial")` that plays BEFORE the main game starts.
   - It must seamlessly combine two parts in ONE continuous scene:
     a) **Concept Explanation**: Use text/visuals to explain the historical context (Civil War).
     b) **Game Tutorial**: Directly transition into demonstrating the mechanics.
   - Do NOT separate them with loading screens or blackouts. It should feel like one single video clip.
   - After the full sequence completes, transition to `go("game")`.

## Requirements

- Output a SINGLE complete `index.html` file.
- Start from the provided template — preserve its structure.
- use Kaplay.js via CDN: `https://unpkg.com/kaplay@3001/dist/kaplay.js`.
- All visuals must use Kaplay primitives (`rect()`, `circle()`, `text()`) — NO external images.
"""

async def main():
    if not DESIGN_DOC_PATH.exists():
        print(f"Error: {DESIGN_DOC_PATH} not found.")
        return

    design_doc = DESIGN_DOC_PATH.read_text()
    if not TEMPLATE_PATH.exists():
        print(f"Error: {TEMPLATE_PATH} not found.")
        return

    template_code = TEMPLATE_PATH.read_text()

    user_prompt = f"""
## Game Design
{design_doc}

## Base Template (platformer)
```html
{template_code}
```

Implement the game with the tutorial scene as requested. Output the complete HTML file.
"""

    llm = get_llm("game_coder").bind_tools([search_kaplay_docs])
    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=user_prompt),
    ]

    print("Generating game with tutorial...")
    
    # Agentic loop
    for _ in range(5):
        response: AIMessage = await llm.ainvoke(messages)
        messages.append(response)

        if not response.tool_calls:
            break

        for call in response.tool_calls:
            print(f"Tool call: {call['name']}")
            tool_msg = await search_kaplay_docs.ainvoke(call["args"])
            messages.append(ToolMessage(content=str(tool_msg), tool_call_id=call["id"]))

    code = extract_text(response.content)
    # Extract HTML
    if "```html" in code:
        code = code.split("```html", 1)[1].rsplit("```", 1)[0].strip()
    elif "```" in code:
        code = code.split("```", 1)[1].rsplit("```", 1)[0].strip()

    OUTPUT_PATH.write_text(code)
    print(f"Game saved to: {OUTPUT_PATH}")

if __name__ == "__main__":
    asyncio.run(main())
