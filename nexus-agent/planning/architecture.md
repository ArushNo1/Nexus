# LangGraph Phaser Game Generator — Architecture & Setup Guide

## Overview

A multi-agent LangGraph pipeline that takes a **JSON lesson plan** as input and produces a **self-contained, documented Phaser 3 HTML game** as output. Five specialized agents collaborate through a shared state graph with conditional feedback loops.

---

## 1. Graph State Schema

Every node reads from and writes to a single `AgentState` TypedDict. This is the backbone of your entire graph.

```python
# state.py
from typing import TypedDict, Literal

class AgentState(TypedDict):
    # ── Input ──
    lesson_plan: dict              # The raw JSON lesson plan

    # ── Game Planner output ──
    game_design_doc: str           # Markdown GDD (genre, mechanics, scenes, learning hooks)
    
    # ── Design Evaluator output ──
    design_feedback: str           # Structured critique
    design_approved: bool          # Gate signal
    
    # ── Coder & Documentor output ──
    phaser_code: str               # The full index.html Phaser game source
    documentation: str             # Inline + sidebar doc block
    
    # ── Asset Generator output ──
    assets: dict                   # {"sprites": [...], "backgrounds": [...], "sounds": [...]}
    assets_embedded: bool          # Whether assets are base64-inlined
    
    # ── Player & Final Evaluator output ──
    playtest_report: str           # Structured QA report
    ship_approved: bool            # Final gate signal
    errors: list[str]              # Runtime errors caught during playtest
    
    # ── Control flow ──
    design_iteration: int          # Tracks planner ↔ evaluator loops (max 3)
    code_iteration: int            # Tracks coder ↔ player loops (max 2)
    status: Literal["planning", "evaluating", "coding", "generating_assets", "playtesting", "done", "failed"]
```

---

## 2. Node Specifications

### Node ① — Game Planner

**Role:** Translate the lesson plan into a concrete Game Design Document (GDD).

| Aspect | Detail |
|---|---|
| **LLM** | Claude Sonnet 4 (creative + structured) |
| **Input from state** | `lesson_plan`, `design_feedback` (if revision loop) |
| **Output to state** | `game_design_doc`, `status → "evaluating"` |
| **Prompt strategy** | System prompt defines GDD template. User prompt injects the lesson plan JSON. If `design_feedback` exists, append it as revision instructions. |

**GDD Template the LLM should produce:**

```markdown
## Game Design Document
### Core Concept
- Genre: (platformer / quiz / puzzle / simulation / etc.)
- Theme & narrative wrapper for the lesson
- Target play time: X minutes

### Learning Integration
- Which objectives map to which mechanics
- Knowledge checks / gates (must answer correctly to proceed)
- Scaffolding: how difficulty ramps with lesson progression

### Phaser Architecture
- Scenes: Boot → Preload → Menu → Level1..N → Results
- Key game objects and their behaviors
- Input handling (keyboard / touch)
- Score / progress tracking

### Assets Needed
- Sprite descriptions (character, enemies, items)
- Background descriptions per scene
- Sound FX list (jump, correct, wrong, victory)

### Scope Constraints
- Single HTML file target
- Phaser 3 CDN (no build step)
- Base64-embedded assets preferred
- < 2MB total file size
```

---

### Node ② — Game Design Evaluator

**Role:** Quality-gate the GDD before any code is written.

| Aspect | Detail |
|---|---|
| **LLM** | Claude Sonnet 4 (analytical) |
| **Input from state** | `game_design_doc`, `lesson_plan` |
| **Output to state** | `design_feedback`, `design_approved`, `design_iteration += 1` |
| **Prompt strategy** | Rubric-based evaluation. LLM scores 1-5 on each axis and makes a binary PASS/REVISE decision. |

**Evaluation Rubric (instruct LLM to score each):**

1. **Pedagogical alignment** — Do mechanics actually teach the objectives?
2. **Fun factor** — Would a student *want* to play this?
3. **Phaser feasibility** — Can this realistically be built in a single HTML file with Phaser 3?
4. **Scope control** — Is it achievable without exceeding complexity budget?
5. **Accessibility** — Keyboard navigable? Color-blind safe? Clear instructions?

**Decision logic:**

```
if all scores >= 3 and average >= 3.5 → PASS
else → REVISE (with specific feedback per low-scoring axis)
```

---

### Node ③ — Game Coder & Documentor

**Role:** Write the actual Phaser 3 game code and comprehensive inline documentation.

| Aspect | Detail |
|---|---|
| **LLM** | Claude Opus (code generation strength) |
| **Input from state** | `game_design_doc`, `assets`, `playtest_report` + `errors` (if fix loop) |
| **Output to state** | `phaser_code`, `documentation`, `status → "generating_assets"` |
| **Tools** | Phaser 3 docs (RAG retrieval), ESLint check (tool call), HTML validator |
| **Prompt strategy** | System prompt contains Phaser 3 boilerplate patterns and best practices. Include the full GDD. If in a fix loop, include the error log and playtest report as revision context. |

**Code structure the LLM should produce (single index.html):**

```
<!DOCTYPE html>
<html>
<head>
  <!-- Lesson metadata in <meta> tags -->
  <!-- Phaser 3 CDN -->
  <script src="https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.min.js"></script>
</head>
<body>
  <script>
    /**
     * ╔══════════════════════════════════════╗
     * ║  GAME DOCUMENTATION                  ║
     * ║  Generated from: [lesson plan title] ║
     * ║  Objectives: [...]                   ║
     * ║  How learning is integrated: [...]   ║
     * ╚══════════════════════════════════════╝
     */

    // ── CONFIG ──
    const config = { /* Phaser config */ };

    // ── SCENE: Boot ──
    class BootScene extends Phaser.Scene { /* ... */ }

    // ── SCENE: Game ──
    class GameScene extends Phaser.Scene {
      /** @doc This scene implements [objective X] through [mechanic Y] */
    }

    // ── SCENE: Results ──
    class ResultsScene extends Phaser.Scene { /* ... */ }

    // ── LAUNCH ──
    new Phaser.Game(config);
  </script>
</body>
</html>
```

**Documentation requirements:**
- JSDoc headers on every class and major method
- A top-level documentation block mapping lesson objectives → game mechanics
- Inline comments explaining *why*, not *what*

---

### Node ④ — Asset Generator

**Role:** Create or source all visual and audio assets, then embed them.

| Aspect | Detail |
|---|---|
| **LLM** | Claude (orchestration) + DALL·E 3 / Stable Diffusion (images) |
| **Input from state** | `game_design_doc` (asset descriptions), `phaser_code` |
| **Output to state** | `assets`, `assets_embedded → true`, updated `phaser_code` with embedded assets |
| **Tools** | Image generation API, SVG programmatic generator, Web Audio / sfxr-style sound generator |

**Asset pipeline:**

```
For each asset in GDD.assets_needed:
  1. Generate image via DALL·E / SD (pixel art style, transparent PNG, 64x64 or 128x128)
  2. Convert to base64 data URI
  3. Inject into phaser_code as:
     this.textures.addBase64('sprite_name', 'data:image/png;base64,...')
  
For sounds:
  1. Generate via jsfxr / Web Audio synthesis parameters
  2. Embed as base64 audio or inline Web Audio code

For backgrounds:
  1. Generate or use CSS gradient fallbacks
  2. Embed as base64 if under size budget
```

**Fallback strategy:** If image generation is unavailable, generate simple colored-rectangle placeholders with text labels and document what should replace them.

---

### Node ⑤ — Game Player & Final Evaluator

**Role:** Actually run the game, catch errors, and evaluate the final product.

| Aspect | Detail |
|---|---|
| **LLM** | Claude Sonnet 4 (analysis) |
| **Input from state** | `phaser_code` (with embedded assets), `lesson_plan`, `game_design_doc` |
| **Output to state** | `playtest_report`, `ship_approved`, `errors`, `code_iteration += 1` |
| **Tools** | Puppeteer/Playwright (headless browser), screenshot tool, console.log/error capture |

**Playtest procedure:**

```
1. STATIC ANALYSIS
   - Parse HTML for syntax errors
   - Check Phaser CDN link is valid
   - Verify all base64 assets are valid

2. RUNTIME TEST (via Puppeteer)
   - Load index.html in headless Chrome
   - Wait 5s, capture console errors → state.errors
   - Take screenshot of each scene (simulate click/key progression)
   - Check: Does the game render? Are there JS errors?

3. LLM EVALUATION (feed screenshots + error log to Claude)
   - Does the game match the GDD?
   - Are learning objectives visually present?
   - Is the documentation block present and accurate?
   - Is the game playable (based on screenshot progression)?

4. DECISION
   - No JS errors + LLM score >= 4/5 → SHIP
   - Else → FIX (with specific error log and critique)
```

---

## 3. Graph Wiring (Conditional Edges)

```python
# graph.py
from langgraph.graph import StateGraph, END

workflow = StateGraph(AgentState)

# ── Add nodes ──
workflow.add_node("game_planner", game_planner_node)
workflow.add_node("design_evaluator", design_evaluator_node)
workflow.add_node("game_coder", game_coder_node)
workflow.add_node("asset_generator", asset_generator_node)
workflow.add_node("game_player", game_player_node)

# ── Set entry point ──
workflow.set_entry_point("game_planner")

# ── Linear edges ──
workflow.add_edge("game_planner", "design_evaluator")
workflow.add_edge("game_coder", "asset_generator")
workflow.add_edge("asset_generator", "game_player")

# ── Conditional edge: Design gate ──
def design_gate(state: AgentState) -> str:
    if state["design_approved"]:
        return "game_coder"
    if state["design_iteration"] >= 3:
        return "game_coder"  # Force proceed after 3 attempts
    return "game_planner"    # Loop back for revision

workflow.add_conditional_edges("design_evaluator", design_gate)

# ── Conditional edge: Ship gate ──
def ship_gate(state: AgentState) -> str:
    if state["ship_approved"]:
        return END
    if state["code_iteration"] >= 2:
        return END           # Ship best effort after 2 fix attempts
    return "game_coder"      # Loop back for fixes

workflow.add_conditional_edges("game_player", ship_gate)

# ── Compile ──
app = workflow.compile()
```

---

## 4. Project File Structure

```
phaser-game-agent/
├── pyproject.toml                   # Project config (use Poetry or uv)
├── .env                             # API keys (ANTHROPIC_API_KEY, OPENAI_API_KEY)
├── .env.example
├── README.md
│
├── src/
│   ├── __init__.py
│   │
│   ├── state.py                     # AgentState TypedDict definition
│   ├── graph.py                     # LangGraph wiring (nodes + edges + compile)
│   ├── main.py                      # CLI entry point: load JSON → run graph → save HTML
│   │
│   ├── nodes/                       # One file per agent node
│   │   ├── __init__.py
│   │   ├── game_planner.py          # Node ① implementation
│   │   ├── design_evaluator.py      # Node ② implementation
│   │   ├── game_coder.py            # Node ③ implementation
│   │   ├── asset_generator.py       # Node ④ implementation
│   │   └── game_player.py           # Node ⑤ implementation
│   │
│   ├── prompts/                     # Prompt templates (keep separate from logic)
│   │   ├── planner_system.md
│   │   ├── planner_user.md          # Jinja2 template with {{lesson_plan}} slot
│   │   ├── evaluator_system.md
│   │   ├── evaluator_rubric.md
│   │   ├── coder_system.md
│   │   ├── coder_phaser_patterns.md # Phaser 3 best practices for RAG
│   │   ├── asset_system.md
│   │   └── player_system.md
│   │
│   ├── tools/                       # LangGraph tool definitions
│   │   ├── __init__.py
│   │   ├── phaser_docs_rag.py       # Vector store retrieval over Phaser 3 docs
│   │   ├── image_generator.py       # DALL·E / SD wrapper
│   │   ├── sound_generator.py       # jsfxr / Web Audio synth
│   │   ├── html_validator.py        # Validates the output HTML
│   │   ├── puppeteer_runner.py      # Headless browser test harness
│   │   └── base64_embedder.py       # Convert assets to data URIs
│   │
│   └── utils/
│       ├── __init__.py
│       ├── llm.py                   # LLM client factory (switch models per node)
│       ├── logger.py                # Structured logging for each node
│       └── config.py                # Pydantic settings (max iterations, model names, etc.)
│
├── data/
│   ├── phaser_docs/                 # Scraped Phaser 3 API docs for RAG
│   │   └── ...chunks.json
│   └── sample_lesson_plans/         # Example inputs for testing
│       ├── fractions_platformer.json
│       ├── photosynthesis_quiz.json
│       └── history_timeline.json
│
├── output/                          # Generated games land here
│   └── .gitkeep
│
└── tests/
    ├── test_state.py
    ├── test_graph_flow.py           # Integration test: mock LLMs, verify state transitions
    ├── test_nodes/
    │   ├── test_planner.py
    │   ├── test_evaluator.py
    │   ├── test_coder.py
    │   ├── test_asset_gen.py
    │   └── test_player.py
    └── fixtures/
        ├── sample_gdd.md
        ├── sample_phaser_code.html
        └── sample_lesson_plan.json
```

---

## 5. Input Schema (JSON Lesson Plan)

```json
{
  "title": "Adding Fractions",
  "subject": "Mathematics",
  "grade_level": "5th Grade",
  "duration_minutes": 15,
  "objectives": [
    "Students can add fractions with unlike denominators",
    "Students can simplify resulting fractions",
    "Students understand visual fraction models"
  ],
  "key_concepts": [
    {"term": "common denominator", "definition": "A shared multiple of two denominators"},
    {"term": "simplify", "definition": "Reduce a fraction to lowest terms"}
  ],
  "difficulty_progression": ["guided_example", "practice", "challenge"],
  "preferences": {
    "genre_hint": "platformer",
    "art_style": "pixel_art",
    "tone": "encouraging",
    "max_questions": 10
  },
  "accessibility": {
    "colorblind_safe": true,
    "keyboard_only": true,
    "text_size_min": 16
  }
}
```

---

## 6. Setup Instructions

### Prerequisites

```bash
# Python 3.11+
python --version

# Node.js 18+ (for Puppeteer)
node --version

# Install uv (fast Python package manager) — or use pip/poetry
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### Installation

```bash
# Clone and enter project
git clone <your-repo-url> phaser-game-agent
cd phaser-game-agent

# Create virtual environment and install dependencies
uv venv
source .venv/bin/activate
uv pip install langgraph langchain-anthropic langchain-openai \
    chromadb playwright pydantic jinja2 rich

# Install Playwright browsers (for game playtesting)
playwright install chromium

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys:
#   ANTHROPIC_API_KEY=sk-ant-...
#   OPENAI_API_KEY=sk-...        (for DALL·E asset generation)
```

### Running

```bash
# Basic run
python -m src.main --input data/sample_lesson_plans/fractions_platformer.json

# With verbose logging
python -m src.main --input data/sample_lesson_plans/fractions_platformer.json --verbose

# Output will be saved to: output/adding_fractions_game.html
```

---

## 7. Key Implementation Patterns

### Pattern A: Node function signature

Every node follows the same shape — takes state, returns partial state update:

```python
# nodes/game_planner.py
from src.state import AgentState

async def game_planner_node(state: AgentState) -> dict:
    """Node ①: Converts lesson plan → Game Design Document."""
    
    # 1. Load prompt template
    system = load_prompt("planner_system.md")
    user = render_template("planner_user.md", {
        "lesson_plan": json.dumps(state["lesson_plan"], indent=2),
        "prior_feedback": state.get("design_feedback", "None — first iteration"),
    })
    
    # 2. Call LLM
    llm = get_llm("claude-sonnet-4-20250514")
    response = await llm.ainvoke([
        SystemMessage(content=system),
        HumanMessage(content=user),
    ])
    
    # 3. Return partial state update
    return {
        "game_design_doc": response.content,
        "status": "evaluating",
    }
```

### Pattern B: Conditional edge with max-iteration safety

```python
def design_gate(state: AgentState) -> str:
    if state["design_approved"]:
        return "game_coder"
    if state["design_iteration"] >= 3:
        print("⚠️  Max design iterations reached, proceeding with best effort")
        return "game_coder"
    return "game_planner"
```

### Pattern C: Phaser docs RAG tool

```python
# tools/phaser_docs_rag.py
from langchain.tools import tool
from chromadb import Client

@tool
def search_phaser_docs(query: str) -> str:
    """Search Phaser 3 documentation for API references and patterns."""
    db = Client()
    collection = db.get_collection("phaser3_docs")
    results = collection.query(query_texts=[query], n_results=5)
    return "\n---\n".join(results["documents"][0])
```

### Pattern D: LLM routing per node

```python
# utils/llm.py
from langchain_anthropic import ChatAnthropic

MODEL_MAP = {
    "game_planner":       "claude-sonnet-4-20250514",
    "design_evaluator":   "claude-sonnet-4-20250514",
    "game_coder":         "claude-sonnet-4-20250514",   # Use Opus if budget allows
    "asset_generator":    "claude-sonnet-4-20250514",
    "game_player":        "claude-sonnet-4-20250514",
}

def get_llm(node_name: str) -> ChatAnthropic:
    return ChatAnthropic(model=MODEL_MAP[node_name], max_tokens=8192)
```

---

## 8. Iteration Budget & Guardrails

| Loop | Max Iterations | Escalation |
|---|---|---|
| Planner ↔ Evaluator | 3 | Force-proceed with best GDD + log warning |
| Coder ↔ Player | 2 | Ship with known issues documented in output HTML |
| Total LLM calls (worst case) | ~12 | 3 plan + 3 eval + 2 code + 2 asset + 2 play |
| Total LLM calls (happy path) | ~5 | 1 each node, no loops |

---

## 9. Extension Points

- **Multiplayer support** — Add a "networking evaluator" node between coder and player
- **Difficulty adaptation** — Store play session data and feed back into a new "difficulty tuner" node
- **Template library** — Cache successful GDDs by genre and lesson type for few-shot prompting
- **Human-in-the-loop** — Use LangGraph's `interrupt_before` on the design_evaluator to let a teacher review the GDD before coding begins
- **LangSmith tracing** — Add `LANGCHAIN_TRACING_V2=true` to .env for full observability of every node execution