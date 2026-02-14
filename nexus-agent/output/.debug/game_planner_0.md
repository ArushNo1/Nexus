# Game Design Document: Photosynthesis Factory

### Core Concept
- **Genre**: Catch / Collection
- **Description**: The player controls a growing leaf to catch the necessary "Ingredients" (Inputs) for photosynthesis while avoiding "Non-essentials" to produce "Energy" (Outputs).
- **Target Play Time**: 3 minutes

### Learning Integration
- **Objective Mapping**: 
    - **Inputs (Catch)**: Sunlight, Water, Carbon Dioxide.
    - **Outputs (Automatic)**: Every time the "Photosynthesis Bar" fills, the plant releases Oxygen and Glucose, and the plant grows larger.
- **Knowledge Check**: Players must distinguish between inputs (Sun, Water, CO2) and distractors (Rocks, Trash, Nitrogen) to keep the plant alive.

### Kaplay Architecture
- **Scenes (3)**:
    1. **Menu**: Title "Photosynthesis Factory", simple "Press Space to Start" text.
    2. **Game**: Main loop. Items fall from the top. Player moves a "Leaf" (green rectangle) left/right.
    3. **Results**: Shows "Total Oxygen Produced" and a summary of the photosynthesis formula ($CO_2 + Water + Light \rightarrow Glucose + Oxygen$).
- **Key Game Objects**:
    - **Player (Leaf)**: Controlled via arrow keys or mouse movement.
    - **Ingredients (Inputs)**: Yellow Circle (Sun), Blue Circle (Water), Grey Circle (CO2).
    - **Distractors**: Brown Square (Rocks/Trash).
    - **UI**: A "Synthesis Bar" that fills as inputs are caught.
- **Input**: Mouse move or Arrow keys (Primary: Mouse for accessibility).
- **Score Tracking**: "Growth Level" (increases with successful synthesis) and "Oxygen Count."

### Assets Needed (Programmatic)
- **Leaf**: `add([rect(60, 20), color(0, 200, 0), pos(), area(), "player"])`
- **Sunlight**: `add([circle(15), color(255, 255, 0), "input", { type: "sun" }])`
- **Water**: `add([circle(15), color(0, 0, 255), "input", { type: "water" }])`
- **CO2**: `add([circle(15), color(150, 150, 150), "input", { type: "co2" }])`
- **Oxygen/Glucose**: Small particles that float UP when a synthesis event occurs.

### Scope Constraints
- **Single File**: All logic in one HTML file using Kaplay CDN.
- **Visuals**: Use `drawRect`, `drawCircle`, and `drawText`. No external `.png` files.
- **Audio**: Simple `play("beep")` or purely visual feedback (screen shake/flash) to save complexity.
- **Simple Loop**: 
    - Catch 3 unique inputs -> Trigger "Photosynthesis" animation.
    - Catch a distractor -> Lose a life/Shrink leaf.
    - Survive for 60 seconds to "Win."

### Learning Flow
1. **Pre-Game**: Instructions state: "Collect Sun, Water, and CO2 to make food!"
2. **In-Game**: Immediate feedback—collecting a blue drop adds to the "Water" meter.
3. **End-Game**: Result screen reinforces the lesson: "Success! You converted Sunlight, Water, and CO2 into Glucose (Food) and Oxygen for us to breathe!"