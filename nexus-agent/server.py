"""FastAPI server for the Kaplay game generator."""
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import asyncio
import os
from pathlib import Path
from rich.console import Console

from graph import build_graph
from state import AgentState
from utils.supabase import update_game

app = FastAPI(title="Kaplay Game Generator API")
console = Console()

from dotenv import load_dotenv
load_dotenv()  # This loads the .env file

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://your-nextjs-app.vercel.app",
        "https://nexus.cognicade.org"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple API key authentication
API_KEY = os.getenv("API_KEY", "PranavDivichenchuIsABum")

class LessonPlanRequest(BaseModel):
    lesson_plan: dict
    user_id: str
    id: str  # UUID of the games row in Supabase
    conversation_id: Optional[str] = None

class GenerateResponse(BaseModel):
    success: bool
    game_id: str
    status: str
    errors: list[str]

async def generate_game(lesson_plan: dict, game_id: str) -> dict:
    """Run the LangGraph agent to generate a game."""
    title = lesson_plan.get("title", "untitled")

    console.print(f"[cyan]Generating game for: {title} (game_id: {game_id})[/cyan]")

    # Mark game as in-progress
    update_game(game_id, {"status": "planning"})

    initial_state: AgentState = {
        "lesson_plan": lesson_plan,
        "game_id": game_id,
        "game_design_doc": "",
        "design_feedback": "",
        "design_approved": False,
        "implementation_plan": "",
        "game_code": "",
        "documentation": "",
        "playtest_report": "",
        "ship_approved": False,
        "errors": [],
        "design_iteration": 0,
        "code_iteration": 0,
        "status": "planning",
    }

    graph = build_graph()
    final_state = await graph.ainvoke(initial_state)

    return final_state

@app.post("/api/generate", response_model=GenerateResponse)
async def generate_kaplay_game(
    request: LessonPlanRequest,
    authorization: str = Header(None)
):
    """Generate a Kaplay game from a lesson plan."""

    # API key authentication
    if authorization != f"Bearer {API_KEY}":
        raise HTTPException(status_code=401, detail="Unauthorized")

    try:
        final_state = await generate_game(request.lesson_plan, request.id)

        status = final_state.get("status", "unknown")
        errors = final_state.get("errors", [])

        # Final Supabase update with completed data
        final_data = {
            "status": status,
            "html_src": final_state.get("game_code", ""),
            "design_doc_data": final_state.get("game_design_doc", ""),
            "errors": errors if errors else None,
        }
        update_game(request.id, final_data)

        return GenerateResponse(
            success=status == "done",
            game_id=request.id,
            status=status,
            errors=errors,
        )

    except Exception as e:
        console.print(f"[red]Error generating game: {str(e)}[/red]")
        # Mark the game as failed in Supabase
        try:
            update_game(request.id, {
                "status": "failed",
                "errors": [str(e)],
            })
        except Exception:
            pass
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
