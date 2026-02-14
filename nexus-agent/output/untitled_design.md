### Core Concept
- **Genre:** Catch / Avoid (Reaction-based identification)
- **One-sentence game description:** Players control a plant's collection zone, catching essential photosynthesis inputs (sunlight, water, carbon dioxide) while skillfully avoiding harmful or released outputs (oxygen, glucose) within a time limit.
- **Target play time:** 3-5 minutes

### Learning Integration
- **Which objectives map to the core mechanic:**
    - **"Students will identify the inputs (sunlight, water, carbon dioxide) and outputs (oxygen, glucose) of photosynthesis."** This is the primary objective tested. The core mechanic requires players to constantly differentiate between inputs and outputs by deciding whether to "catch" or "avoid" falling elements.
- **How the player is tested:**
    - **Knowledge Check Type:** Categorization and quick identification. Players are presented with various elements and must categorize them in real-time as either an "input" (to be collected) or an "output" (to be avoided/released). Correct actions earn points, while incorrect actions or missed inputs result in penalties.

### Kaplay Architecture
- **Scenes (3 max):**
    1.  **`menu`:** Displays the game title ("Photosynthesis Collector"), brief instructions, and a "Start Game" button.
    2.  **`game`:** The main gameplay loop. Features the player-controlled plant base, falling elements, score display, and a countdown timer.
    3.  **`results`:** Shows the final score, a brief reinforcing statement about photosynthesis, and a "Play Again" button.
- **Key game objects (under 5 types):**
    -   **`player`**: A horizontal rectangle at the bottom of the screen, representing the plant's collection area. Moves left/right.
    -   **`element`**: Text objects (e.g., "Sunlight", "Water", "CO2", "Oxygen", "Glucose") that fall from the top of the screen. Each has a tag indicating if it's an "input" or "output".
    -   **`score_text`**: A UI element displaying the player's current score.
    -   **`timer_text`**: A UI element displaying the remaining game time.
- **Input:** Keyboard (left and right arrow keys) to move the `player` horizontally.
- **Score tracking approach:** A single `score` variable.
    -   Catching an "input": +1 point
    -   Catching an "output": -1 point
    -   An "input" falling off-screen (missed): -1 point
    -   An "output" falling off-screen (successfully avoided): 0 points (no penalty)

### Assets Needed
- **Visuals:**
    -   Rectangles for the `player` and potentially a simple "ground" line.
    -   Text for all falling `elements` (e.g., "Sunlight", "CO2"), score, timer, menu titles, instructions, and results messages.
    -   Colors for differentiation (e.g., green for player, white for text).
- **Audio:** None (to keep the scope minimal).

### Scope Constraints
- The game will be implemented as a single HTML file.
- The total code size will be kept under 500 lines.
- Kaplay.js will be loaded via CDN.
- All graphics will be programmatic (rectangles, circles, text) using Kaplay's drawing primitives.
- No external image assets will be used.