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