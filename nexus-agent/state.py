# state.py
from typing import TypedDict, Literal

class AgentState(TypedDict):
    # ── Input ──
    lesson_plan: dict              # The raw JSON lesson plan
    game_id: str                   # UUID of the games row in Supabase

    # ── Game Planner output ──
    game_type: str                 # One of: beatemup, fighter, maze, platformer, shootemup
    template_code: str             # The base HTML template for the chosen game type
    game_design_doc: str           # Game type choice rationale + addon feature description
    
    # ── Design Evaluator output ──
    design_feedback: str           # Structured critique
    design_approved: bool          # Gate signal
    
    # ── Implementation Planner output ──
    implementation_plan: str           # Detailed todo list & implementation roadmap

    # ── Coder & Documentor output ──
    game_code: str               # The full index.html Kaplay game source
    documentation: str             # Inline + sidebar doc block
    
    # ── Player & Final Evaluator output ──
    playtest_report: str           # Structured QA report
    ship_approved: bool            # Final gate signal
    errors: list[str]              # Runtime errors caught during playtest
    
    # ── Control flow ──
    design_iteration: int          # Tracks planner ↔ evaluator loops (max 3)
    code_iteration: int            # Tracks coder ↔ player loops (max 2)
    status: Literal["planning", "evaluating", "implementation_planning", "coding", "playtesting", "done", "failed"]