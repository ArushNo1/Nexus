"""Test the implementation planner node with a photosynthesis game lesson plan."""

import asyncio
import json
from pathlib import Path

import sys
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from nodes.implementation_planner import implementation_planner_node

SAMPLE_LESSON_PLAN = {
    "lessonPlan": {
        "title": "Introduction to Photosynthesis",
        "duration": "60 minutes",
        "gradeLevel": "Level: 5th Grade",
        "subject": "Science",
        "objectives": [
            "Students will be able to define photosynthesis.",
            "Students will identify the inputs (sunlight, water, carbon dioxide) and outputs (oxygen, glucose) of photosynthesis.",
            "Students will explain the importance of photosynthesis for life on Earth.",
        ],
        "standards": [
            "NGSS 5-LS1-1: Support an argument that plants get the materials they need for growth chiefly from air and water."
        ],
    },
    "assessments": [
        {
            "type": "Quiz",
            "title": "Photosynthesis Quiz",
            "questions": [
                {"questionText": "What gas do plants take in?", "correctAnswer": "Carbon Dioxide"},
                {"questionText": "What gas do plants release?", "correctAnswer": "Oxygen"},
                {"questionText": "What is the main source of energy for plants?", "correctAnswer": "Sunlight"},
            ],
        }
    ],
}

SAMPLE_GDD = """\
# Photosynthesis Factory — Game Design Document

## Genre
Puzzle / Resource Management

## Concept
The player controls a plant that must collect sunlight, water, and CO2 to produce glucose and oxygen. Each level introduces a new photosynthesis concept, with quiz checkpoints between levels.

## Scenes
1. **menu** — Title screen with "Start" button
2. **game** — Main gameplay: drag sunlight, water, and CO2 into the plant's leaf
3. **quiz** — Multiple-choice questions about photosynthesis between levels
4. **results** — Final score and review of correct/incorrect answers

## Mechanics
- Sunlight rays fall from the top of the screen; player clicks to collect them
- Water droplets rise from the bottom; player clicks to absorb them
- CO2 molecules float in from the sides; player clicks to capture them
- When all 3 inputs are collected, the plant produces glucose (score +1) and releases O2 (visual bubble animation)
- Timer per level: 30 seconds
- After each level, a quiz scene tests knowledge

## Learning Hooks
- Each resource displays its name (e.g., "CO₂ — Carbon Dioxide") when collected
- The glucose output shows the simplified equation: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂
- Quiz questions pulled from lesson plan assessments

## Art Style
- Simple geometric shapes: green rectangles for leaves, yellow circles for sun, blue teardrops for water, gray circles for CO2
- Bright, friendly color palette

## Audio
- Cheerful background music loop
- "Pop" sound on resource collection
- "Ding" on correct quiz answer, "Buzz" on incorrect
"""


def build_test_state():
    return {
        "lesson_plan": SAMPLE_LESSON_PLAN,
        "game_design_doc": SAMPLE_GDD,
        "design_feedback": "",
        "design_approved": True,
        "implementation_plan": "",
        "game_code": "",
        "documentation": "",
        "assets": {},
        "assets_embedded": False,
        "playtest_report": "",
        "ship_approved": False,
        "errors": [],
        "design_iteration": 1,
        "code_iteration": 0,
        "status": "implementation_planning",
    }


async def main():
    state = build_test_state()
    print("Running implementation planner node...")
    print(f"Lesson: {state['lesson_plan']['lessonPlan']['title']}")
    print("-" * 60)

    result = await implementation_planner_node(state)

    print("\n" + "=" * 60)
    print("STATUS:", result["status"])
    print("=" * 60)
    print("\nIMPLEMENTATION PLAN:\n")
    print(result["implementation_plan"])

    # Basic assertions
    assert result["status"] == "coding", f"Expected status 'coding', got '{result['status']}'"
    assert len(result["implementation_plan"]) > 100, "Implementation plan is too short"
    print("\n✓ All assertions passed")


if __name__ == "__main__":
    asyncio.run(main())
