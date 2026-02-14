## Kaplay.js Game Implementation Plan: Photosynthesis Collector

This plan details the step-by-step implementation of the "Photosynthesis Collector" game using Kaplay.js, based on the provided Game Design Document.

### 1. Technical Architecture Overview

*   **File Structure:** Single `index.html` file containing all HTML, CSS (minimal, for canvas container), and JavaScript code.
*   **Kaplay Config:**
    
```javascript
    kaplay({
        width: 800,
        height: 600,
        background: [100, 149, 237], // Cornflower Blue
        stretch: true,
        letterbox: true,
        debug: true, // For development
    });
    ```

*   **Scene List:**
    1.  **`menu`**:
        *   **Entry:** Initial load of the game, or `go("menu")` from `results` scene.
        *   **Exit:** `go("game")` when "Start Game" button is clicked.
    2.  **`game`**:
        *   **Entry:** `go("game")` from `menu` scene.
        *   **Exit:** `go("results", { score: finalScore })` when timer runs out or game ends.
    3.  **`results`**:
        *   **Entry:** `go("results", { score: finalScore })` from `game` scene.
        *   **Exit:** `go("menu")` when "Play Again" button is clicked.

### 2. Ordered Task List

#### Phase 1 — Boilerplate & Config

1.  **Create `index.html` skeleton:**
    *   Add basic HTML5 structure (`<!DOCTYPE html>`, `<html>`, `<head>`, `<body>`).
    *   Include a `<canvas>` element (Kaplay will attach to this by default, or create one).
    *   Add a `<script>` tag for game logic.
    *   **Acceptance Criteria:** A blank HTML page is rendered.
2.  **Import Kaplay.js via CDN:**
    *   Add `<script src="https://unpkg.com/kaplay@3001/dist/kaplay.js"></script>` within the `<head>` or at the end of `<body>`.
    *   **Acceptance Criteria:** Kaplay global `k` (or `kaplay`) object is accessible in the console.
3.  **Initialize Kaplay:**
    *   Call `kaplay({ width: 800, height: 600, background: [100, 149, 237], stretch: true, letterbox: true, debug: true })` at the start of the game script.
    *   **Acceptance Criteria:** A canvas element appears with the specified dimensions and background color.
4.  **Register Scenes:**
    *   Define empty `scene("menu", () => {})`, `scene("game", () => {})`, and `scene("results", () => {})`.
    *   Call `go("menu")` to start the game.
    *   **Acceptance Criteria:** Game starts and transitions to the `menu` scene (even if empty).

#### Phase 2 — Core Scenes

1.  **Implement `menu` scene:**
    *   **Add game title:** Use `add([text("Photosynthesis Collector", { size: 48 }), pos(center().x, height() * 0.2), origin("center")])`.
    *   **Add instructions:** Use `add([text("Catch Sunlight, Water, CO2. Avoid Oxygen, Glucose.", { size: 24 }), pos(center().x, height() * 0.4), origin("center")])`.
    *   **Add "Start Game" button:**
        *   Create a clickable rectangle: `add([rect(200, 60), pos(center().x, height() * 0.7), origin("center"), color(0, 200, 0), "start_button"])`.
        *   Add text over the button: `add([text("Start Game", { size: 32 }), pos(center().x, height() * 0.7), origin("center"), color(0, 0, 0), "start_button_text"])`.
        *   Register `onClick` handler: `onClick("start_button", () => go("game"))`.
    *   **Acceptance Criteria:** Menu scene displays title, instructions, and a clickable "Start Game" button that transitions to the `game` scene.

2.  **Implement `game` scene (basic structure):**
    *   **Initialize score and timer:** `let score = 0; let time = 60;`.
    *   **Add `player` object:**
        *   `add([rect(100, 20), pos(width() / 2, height() - 50), origin("center"), color(0, 150, 0), area(), "player"])`.
    *   **Add `score_text` UI:** `add([text(score, { size: 32 }), pos(20, 20), { value: score }, "score_text"])`.
    *   **Add `timer_text` UI:** `add([text(time, { size: 32 }), pos(width() - 20, 20), origin("topright"), { value: time }, "timer_text"])`.
    *   **Acceptance Criteria:** Game scene loads with a player rectangle, initial score, and timer displayed.

3.  **Implement `results` scene:**
    *   **Receive score:** Use `scene("results", (data) => { let finalScore = data.score; ... })`.
    *   **Display final score:** `add([text("Final Score: " + finalScore, { size: 48 }), pos(center().x, height() * 0.3), origin("center")])`.
    *   **Add reinforcing message:** `add([text("Great job identifying inputs and outputs!", { size: 24 }), pos(center().x, height() * 0.5), origin("center")])`.
    *   **Add "Play Again" button:**
        *   Similar to "Start Game" button: `add([rect(200, 60), pos(center().x, height() * 0.7), origin("center"), color(0, 200, 0), "play_again_button"])`.
        *   Text: `add([text("Play Again", { size: 32 }), pos(center().x, height() * 0.7), origin("center"), color(0, 0, 0), "play_again_text"])`.
        *   `onClick`: `onClick("play_again_button", () => go("menu"))`.
    *   **Acceptance Criteria:** Results scene displays the final score, a message, and a "Play Again" button that returns to the `menu`.

#### Phase 3 — Game Mechanics

1.  **Player Movement (`game` scene):**
    *   **Left/Right controls:**
        *   `onKeyDown("left", () => { get("player")[0].move(-200, 0); })`.
        *   `onKeyDown("right", () => { get("player")[0].move(200, 0); })`.
    *   **Boundary checks:** Ensure player stays within `width()` bounds.
        *   `onUpdate(() => { const player = get("player")[0]; if (player.pos.x < player.width / 2) player.pos.x = player.width / 2; if (player.pos.x > width() - player.width / 2) player.pos.x = width() - player.width / 2; })`.
    *   **Acceptance Criteria:** Player moves left/right with arrow keys and stays within screen bounds.

2.  **Falling `element` spawning (`game` scene):**
    *   **Define element types:** An array of objects, e.g., `[{ text: "Sunlight", type: "input", color: YELLOW }, { text: "Oxygen", type: "output", color: BLUE }]`.
    *   **Spawning logic:**
        *   Use `loop(1, () => { ... })` to spawn elements every 1 second.
        *   Randomly select an element type from the defined array.
        *   Spawn element: `add([text(element.text, { size: 28 }), pos(rand(0, width()), 0), origin("center"), color(element.color), area(), body(), element.type, "element"])`.
            *   **Hint:** `body()` component makes it fall. `area()` for collision. Tag `element.type` and `"element"` for identification.
    *   **Acceptance Criteria:** Elements (text) fall from the top of the screen at regular intervals.

3.  **Collision Handling (`game` scene):**
    *   **Player-element collision:**
        *   `onCollide("player", "element", (player, element) => { ... })`.
        *   If `element.is("input")`: `score_text.value++; score_text.text = score_text.value;`
        *   If `element.is("output")`: `score_text.value--; score_text.text = score_text.value;`
        *   Destroy element: `destroy(element)`.
    *   **Acceptance Criteria:** When player collides with an element, score updates correctly based on element type, and the element is removed.

4.  **Element falling off-screen (`game` scene):**
    *   `onUpdate("element", (element) => { if (element.pos.y > height()) { ... } })`.
    *   If `element.is("input")`: `score_text.value--; score_text.text = score_text.value;`.
    *   If `element.is("output")`: Do nothing (successfully avoided).
    *   Destroy element: `destroy(element)`.
    *   **Acceptance Criteria:** Missed inputs decrease score, avoided outputs have no effect, and elements are destroyed when they leave the screen.

5.  **Game Timer (`game` scene):**
    *   **Countdown:** Use `loop(1, () => { time--; timer_text.text = time; if (time <= 0) go("results", { score: score_text.value }); })`.
    *   **Acceptance Criteria:** Timer counts down and game transitions to `results` scene when time reaches zero, passing the final score.

#### Phase 4 — Learning Integration

1.  **Core mechanic as assessment:** The act of catching/avoiding elements directly tests the identification of photosynthesis inputs and outputs.
    *   **Acceptance Criteria:** Game logic correctly differentiates between input/output elements for scoring.
2.  **Reinforcing message in `results` scene:** The message "Great job identifying inputs and outputs!" reinforces the learning objective.
    *   **Acceptance Criteria:** Message is displayed in the `results` scene.

#### Phase 5 — UI & HUD

1.  **Score display (`game` scene):**
    *   Already implemented in Phase 2/3.
    *   **Acceptance Criteria:** Score updates in real-time.
2.  **Timer display (`game` scene):**
    *   Already implemented in Phase 2/3.
    *   **Acceptance Criteria:** Timer counts down and displays correctly.
3.  **Menu/Instructions (`menu` scene):**
    *   Already implemented in Phase 2.
    *   **Acceptance Criteria:** Menu displays clearly and guides the player.
4.  **Game-over screen (`results` scene):**
    *   Already implemented in Phase 2.
    *   **Acceptance Criteria:** Results screen shows final score and "Play Again" option.

#### Phase 6 — Audio & Visual Polish

1.  **Placeholder sprites/shapes:**
    *   **`player`:** Green `rect(100, 20)`. (`color(0, 150, 0)`)
    *   **`element` text:** White text, varying sizes. Inputs could be bright colors (e.g., `rgb(255, 255, 0)` for Sunlight, `rgb(0, 0, 255)` for Water, `rgb(100, 100, 100)` for CO2). Outputs could be darker/different colors (e.g., `rgb(0, 200, 255)` for Oxygen, `rgb(150, 75, 0)` for Glucose).
    *   **UI text:** White text for scores, timers, menu.
    *   **Buttons:** Green `rect()` with black text.
    *   **Acceptance Criteria:** All game objects and UI elements are rendered with specified colors and dimensions.
2.  **No Audio:** Explicitly stated in GDD.
    *   **Acceptance Criteria:** No sound effects or music are present.

#### Phase 7 — Edge Cases & Robustness

1.  **Input Validation/Boundary Checks:**
    *   Player movement already includes boundary checks.
    *   **Acceptance Criteria:** Player cannot move off-screen.
2.  **Mobile/Touch Support:**
    *   Consider adding `onClick` or `onTouchStart` for player movement for future expansion, but not required by GDD. Current keyboard input is sufficient for initial scope.
    *   **Acceptance Criteria:** Game is playable with keyboard on desktop.
3.  **Error Handling:**
    *   Kaplay's debug mode helps during development. No explicit runtime error handling required for this scope.
    *   **Acceptance Criteria:** No console errors during normal gameplay.

### 3. Dependency Map

*   **Phase 1** (Boilerplate) is a prerequisite for all other phases.
*   **Scene Registration** (P1.4) blocks all subsequent scene-specific tasks (P2.1, P2.2, P2.3).
*   **Player Object Creation** (P2.2) blocks **Player Movement** (P3.1) and **Collision Handling** (P3.3).
*   **Score/Timer UI Creation** (P2.2) blocks **Score/Timer Logic Updates** (P3.3, P3.4, P3.5).
*   **Element Spawning** (P3.2) blocks **Element Collision** (P3.3) and **Off-screen Handling** (P3.4).
*   **Learning Integration** (P4) is embedded within **Game Mechanics** (P3) and **Results Scene** (P2.3).
*   **UI & HUD** (P5) tasks are intertwined with **Core Scenes** (P2) and **Game Mechanics** (P3).
*   **Audio & Visual Polish** (P6) can be done in parallel with most P3 and P4 tasks once core objects are present, but depends on basic object existence (P2.2).
*   **Edge Cases & Robustness** (P7) can be addressed iteratively or at the end, as basic checks are often part of initial implementation.

**Critical Path:** Phase 1 -> Phase 2 (Menu -> Game -> Results) -> Phase 3 (Player, Elements, Collision, Timer) -> Phase 4 (Learning Integration via mechanics) -> Phase 5 (UI refinement).

### 4. Acceptance Criteria

*   **Phase 1 — Boilerplate & Config:**
    *   **P1.1:** `index.html` file exists with basic structure.
    *   **P1.2:** Kaplay.js is loaded successfully.
    *   **P1.3:** Kaplay canvas is initialized with specified dimensions and background.
    *   **P1.4:** All three scenes (`menu`, `game`, `results`) are registered, and the game starts in `menu`.
*   **Phase 2 — Core Scenes:**
    *   **P2.1:** `menu` scene displays title, instructions, and a functional "Start Game" button.
    *   **P2.2:** `game` scene displays player, initial score (0), and timer (60).
    *   **P2.3:** `results` scene displays final score, a reinforcing message, and a functional "Play Again" button.
*   **Phase 3 — Game Mechanics:**
    *   **P3.1:** Player moves left/right with arrow keys, constrained within screen boundaries.
    *   **P3.2:** Text elements ("Sunlight", "Water", etc.) fall from the top of the screen at regular intervals.
    *   **P3.3:** Colliding with an "input" element increases score by 1; colliding with an "output" decreases score by 1. Elements are destroyed on collision.
    *   **P3.4:** An "input" element falling off-screen decreases score by 1. An "output" element falling off-screen has no score impact. Elements are destroyed when off-screen.
    *   **P3.5:** Timer counts down from 60 seconds, and the game transitions to the `results` scene when time reaches 0, passing the current score.
*   **Phase 4 — Learning Integration:**
    *   **P4.1:** Game mechanics accurately differentiate and score based on input/output identification.
    *   **P4.2:** The `results` scene provides a reinforcing statement about photosynthesis.
*   **Phase 5 — UI & HUD:**
    *   **P5.1:** Score is clearly displayed and updates in real-time.
    *   **P5.2:** Timer is clearly displayed and counts down accurately.
    *   **P5.3:** Menu and instructions are clear and legible.
    *   **P5.4:** Game-over screen presents final score and replay option effectively.
*   **Phase 6 — Audio & Visual Polish:**
    *   **P6.1:** All game objects and UI elements use the specified programmatic shapes and colors.
    *   **P6.2:** No audio elements are present in the game.
*   **Phase 7 — Edge Cases & Robustness:**
    *   **P7.1:** Player movement is correctly constrained to the game screen.
    *   **P7.2:** Game is playable using keyboard controls.
    *   **P7.3:** No unhandled runtime errors occur during gameplay.