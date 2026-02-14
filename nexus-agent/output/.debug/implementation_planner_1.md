Here's a detailed implementation plan for the "Photosynthesis Factory" Kaplay.js game:

## 1. Technical Architecture Overview

*   **File Structure:** A single `index.html` file will contain all game logic, styles, and Kaplay.js library import.
    
```html
    <!DOCTYPE html>
    <html>
    <head>
        <title>Photosynthesis Factory</title>
        <style>
            body { margin: 0; overflow: hidden; }
            canvas { display: block; }
        </style>
    </head>
    <body>
        <script src="https://unpkg.com/kaplay@3001/dist/kaplay.js"></script>
        <script>
            // Kaplay.js game code goes here
        </script>
    </body>
    </html>
    ```


*   **Kaplay Config:**
    
```javascript
    kaplay({
        width: 960, // Example width
        height: 640, // Example height
        background: [50, 50, 150], // Dark blue background for space/sky
        // Other potential configs: fullscreen, stretch, letterbox, crisp, debug
    });
    ```


*   **Scene List:**
    1.  **`menu`**:
        *   **Entry:** Initial `go("menu")` on game start.
        *   **Exit:** `go("game")` when "Start" button is clicked.
    2.  **`game`**:
        *   **Entry:** `go("game")` from `menu` or after `quiz`. Takes `level` as parameter.
        *   **Exit:** `go("quiz")` when level timer ends or objectives met.
    3.  **`quiz`**:
        *   **Entry:** `go("quiz")` from `game`. Takes `currentLevel` and `score` as parameters.
        *   **Exit:** `go("game")` (next level) or `go("results")` (if all levels complete).
    4.  **`results`**:
        *   **Entry:** `go("results")` from `quiz` after final level. Takes `finalScore` and `quizResults` as parameters.
        *   **Exit:** `go("menu")` for replay.

## 2. Ordered Task List

### Phase 1 — Boilerplate & Config

1.  **HTML Skeleton:** Create `index.html` with basic `head`, `body`, and `style` for canvas.
    *   **Hint:** Include `kaplay.js` CDN script tag.
2.  **Kaplay Initialization:** Call `kaplay()` with `width`, `height`, and `background` config.
    *   **Hint:** `kaplay({ width: 960, height: 640, background: [50, 50, 150] });`
3.  **Scene Registration:** Define empty `scene()` blocks for `menu`, `game`, `quiz`, and `results`.
    *   **Hint:** `scene("menu", () => {}); scene("game", () => {});`
4.  **Initial Scene Load:** Call `go("menu")` at the end of the script.

### Phase 2 — Core Scenes

1.  **`menu` Scene Setup:**
    *   Add game title `text()`.
    *   Add "Start" button `text()` with `area()` and `onClick()` to `go("game", { level: 1, totalScore: 0 })`.
    *   **Hint:** `add([text("Photosynthesis Factory"), pos(center()), anchor("center"), color(rgb(255, 255, 0))]);`
2.  **`game` Scene Setup (Basic Layout):**
    *   Add `plant` object (green `rect()`) at the bottom-center. Give it a tag like `"plant"`.
    *   Add placeholder `text()` for score and timer.
    *   **Hint:** `add([rect(150, 200), color(0, 150, 0), pos(width() / 2, height() - 100), anchor("center"), area(), "plant"]);`
3.  **`quiz` Scene Setup (Basic Layout):**
    *   Add `text()` component for displaying the question.
    *   Add multiple `text()` components for answer choices, each with `area()` and a unique tag (e.g., `"answer-A"`, `"answer-B"`).
    *   **Hint:** `add([text("Question text?"), pos(width() / 2, 100), anchor("center")]);`
4.  **`results` Scene Setup (Basic Layout):**
    *   Add `text()` for "Game Over" or "Results".
    *   Add `text()` to display final score.
    *   Add `text()` for "Play Again?" button with `area()` and `onClick()` to `go("menu")`.

### Phase 3 — Game Mechanics

1.  **Resource Spawning (Game Scene):**
    *   Implement functions (`spawnSunlight`, `spawnWater`, `spawnCO2`) that `add()` resources (yellow `circle()` for sun, blue `rect()` for water, gray `circle()` for CO2).
    *   Each resource needs `pos()`, `area()`, a type tag (e.g., `"sunlight"`, `"water"`, `"co2"`), and a general tag (`"collectible"`).
    *   Use recursive `wait(rand(min, max), spawnFunction)` to spawn resources at random intervals and positions.
    *   **Hint:** `add([circle(20), color(255, 255, 0), pos(rand(0, width()), 0), area(), "sunlight", "collectible", "moves-down"]);`
2.  **Resource Movement (Game Scene):**
    *   Implement `onUpdate()` handlers for resources to move them across the screen (sunlight down, water up, CO2 horizontally).
    *   Destroy resources that go off-screen to prevent memory leaks.
    *   **Hint:** `onUpdate("moves-down", (obj) => { obj.pos.y += 50 * dt(); if (obj.pos.y > height()) destroy(obj); });`
3.  **Resource Collection (Game Scene):**
    *   Register `onClick("collectible", (resource) => { ... })` handler.
    *   Inside the handler, `destroy(resource)` and update internal state variables for collected resources (e.g., `hasSunlight = true`).
    *   **Hint:** Maintain a count or boolean for each resource type needed for photosynthesis in the current level.
4.  **Photosynthesis Logic (Game Scene):**
    *   After a resource is collected, check if all required inputs (sunlight, water, CO2) are present.
    *   If all inputs are present:
        *   Increment game score.
        *   Reset input state variables (e.g., `hasSunlight = false`).
        *   Trigger O2 release animation.
    *   **Hint:** Use a counter for `inputsCollected` and check `if (inputsCollected >= 3) { /* produce glucose/oxygen */ }`.
5.  **Level Timer (Game Scene):**
    *   Add a `timer()` component to the scene or a dedicated game object.
    *   Use `onUpdate()` to decrement a `timeLeft` variable.
    *   When `timeLeft` reaches 0, `go("quiz", { currentLevel: level, totalScore: score })`.
6.  **Quiz Question Logic (Quiz Scene):**
    *   Load quiz questions from the GDD's assessment JSON.
    *   Display the current question `text()`.
    *   Populate answer choices `text()` components.
    *   Store the `correctAnswer` for the current question.
7.  **Quiz Answer Handling (Quiz Scene):**
    *   Register `onClick()` for each answer choice.
    *   Compare the clicked answer with the `correctAnswer`.
    *   Provide visual/audio feedback (correct/incorrect).
    *   Update `quizScore` for the current level.
    *   Move to the next question or `go("game")` / `go("results")` after all questions for the level.

### Phase 4 — Learning Integration

1.  **Resource Name Display (Game Scene):**
    *   On `onHover()` for `collectible` resources, display a temporary `text()` label with the resource's name (e.g., "CO₂ — Carbon Dioxide").
    *   **Hint:** `onHover("collectible", (obj) => { const label = add([text(obj.name), pos(obj.pos.x, obj.pos.y - 30), life(0.5)]); obj.onHoverEnd(() => destroy(label)); });`
2.  **Photosynthesis Equation Display (Game Scene):**
    *   When photosynthesis occurs, display the equation `text()` near the plant for a short duration.
    *   **Hint:** `const equationText = add([text("6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂", { size: 16 }), pos(plant.pos.x, plant.pos.y - 150), anchor("center"), life(2)]);`
3.  **Quiz Content Population (Quiz Scene):**
    *   Use the provided lesson plan's quiz questions and answers to dynamically populate the quiz scene.
    *   **Hint:** Store questions in an array and iterate through them.
4.  **Quiz Feedback System (Quiz Scene):**
    *   Visually highlight correct/incorrect answers (e.g., change `color()` of the answer text).
    *   Play "Ding" sound for correct, "Buzz" for incorrect.

### Phase 5 — UI & HUD

1.  **Score Display (Game Scene):**
    *   Update the `text()` component for the score (`scoreLabel.text = "Score: " + currentScore;`).
2.  **Timer Display (Game Scene):**
    *   Update the `text()` component for the timer (`timerLabel.text = "Time: " + Math.ceil(timeLeft);`).
3.  **Instructions (Menu Scene):**
    *   Add brief instructions `text()` on how to play below the title in the `menu` scene.
4.  **Game-Over/Results Screen (Results Scene):**
    *   Display `text()` summarizing performance, including final score and perhaps a breakdown of quiz results.
    *   **Hint:** Pass `quizResults` (e.g., an array of {question, userAnswer, correctAnswer}) to the `results` scene.

### Phase 6 — Audio & Visual Polish

1.  **Placeholder Sprites/Shapes:**
    *   **Plant:** `rect(150, 200), color(rgb(0, 150, 0))`
    *   **Sunlight:** `circle(20), color(rgb(255, 255, 0))`
    *   **Water:** `rect(30, 40), color(rgb(0, 100, 200))`
    *   **CO2:** `circle(25), color(rgb(100, 100, 100))`
    *   **O2 Bubble:** `circle(15), color(rgb(150, 200, 255), 0.7)`
    *   **Text:** `color(rgb(255, 255, 255))` by default, `size: 24` for HUD, `size: 36` for titles.
2.  **Load Audio:**
    *   `loadSound("bg-music", "path/to/music.mp3");`
    *   `loadSound("collect-sfx", "path/to/pop.mp3");`
    *   `loadSound("correct-sfx", "path/to/ding.mp3");`
    *   `loadSound("incorrect-sfx", "path/to/buzz.mp3");`
3.  **Background Music:**
    *   Play background music on `game` scene entry, set to `loop: true`.
    *   **Hint:** `const music = play("bg-music", { loop: true, volume: 0.5 }); onSceneLeave(() => music.stop());`
4.  **Sound Effects:**
    *   Play "pop" sound on resource collection.
    *   Play "ding" on correct quiz answer, "buzz" on incorrect.
5.  **O2 Bubble Animation (Game Scene):**
    *   When O2 is released, `add()` an `O2 bubble` object.
    *   Use `tween()` to animate its `pos.y` upwards and `opacity` to fade out, then `destroy()` it.
    *   **Hint:** `obj.tween(obj.pos, vec2(obj.pos.x, obj.pos.y - 100), 1.5, (p) => obj.pos = p, easings.easeOutQuad); obj.tween(obj.opacity, 0, 1.5, (a) => obj.opacity = a);`
6.  **Scene Transitions:**
    *   Consider using `tween()` for screen fades or simple animations when transitioning between scenes.

### Phase 7 — Edge Cases & Robustness

1.  **Off-screen Resource Cleanup:** Ensure all resources that move off-screen are `destroy()`ed to prevent memory leaks.
2.  **Input Debouncing/Validation:** Prevent multiple clicks on the same resource in quick succession, though `destroy()` handles this implicitly for collected items.
3.  **Mobile/Touch Support:** Kaplay's `onClick` generally handles touch events, but ensure hitboxes (`area()`) are generous enough for touch targets.
4.  **Game State Reset:** Ensure all game variables (score, collected inputs, timer) are properly reset when starting a new game or replaying a level.
5.  **Quiz Progress:** Handle the case where a user completes all quiz questions for a level and moves to the next, or if it's the final level, transitions to `results`.

## 3. Dependency Map

*   **Critical Path (Sequential):**
    *   Phase 1 (Boilerplate) -> Phase 2.1 (Menu Scene) -> Phase 3.1 (Start button functionality) -> Phase 2.2 (Game Scene basic) -> Phase 3.2 (Resource movement) -> Phase 3.3 (Resource collection) -> Phase 3.4 (Photosynthesis logic) -> Phase 3.5 (Level timer) -> Phase 2.3 (Quiz Scene basic) -> Phase 3.6 (Quiz logic) -> Phase 2.4 (Results Scene basic) -> Phase 3.7 (Quiz answer handling and scene transitions).
*   **Blocking Tasks:**
    *   `game` scene setup blocks resource spawning and game mechanics.
    *   Resource collection blocks photosynthesis logic.
    *   Level timer blocks transition to `quiz`.
    *   Quiz scene setup blocks quiz question/answer logic.
*   **Parallelizable Tasks:**
    *   UI elements (HUD, menus) can be designed while core mechanics are being prototyped.
    *   Audio loading and integration (Phase 6.2, 6.3, 6.4) can run in parallel with core gameplay and UI.
    *   Visual polish (Phase 6.1, 6.5, 6.6) can largely be done independently once core objects exist.
    *   Learning integration (Phase 4) can be integrated as scenes and mechanics are built, but the content itself is ready.

## 4. Acceptance Criteria

*   **Phase 1 — Boilerplate & Config**
    *   **HTML Skeleton:** Done when `index.html` loads a blank Kaplay canvas.
    *   **Kaplay Initialization:** Done when Kaplay canvas is created with specified dimensions and background color.
    *   **Scene Registration:** Done when `menu`, `game`, `quiz`, `results` scenes are defined and accessible.
    *   **Initial Scene Load:** Done when the game starts directly into the "menu" scene.
*   **Phase 2 — Core Scenes**
    *   **`menu` Scene Setup:** Done when a title and a clickable "Start" button are visible and transition to `game` scene.
    *   **`game` Scene Setup (Basic Layout):** Done when a static plant object and placeholder score/timer text are displayed.
    *   **`quiz` Scene Setup (Basic Layout):** Done when placeholder question and answer options are displayed.
    *   **`results` Scene Setup (Basic Layout):** Done when a game over message, final score placeholder, and a "Play Again" button are displayed.
*   **Phase 3 — Game Mechanics**
    *   **Resource Spawning:** Done when sunlight, water, and CO2 objects appear on screen at semi-random intervals and positions.
    *   **Resource Movement:** Done when resources move correctly across the screen and are destroyed off-screen.
    *   **Resource Collection:** Done when clicking a resource destroys it and registers its collection internally.
    *   **Photosynthesis Logic:** Done when collecting all three resources (sun, water, CO2) triggers a score increment and resets inputs.
    *   **Level Timer:** Done when a timer counts down in the `game` scene and transitions to `quiz` when it reaches zero.
    *   **Quiz Question Logic:** Done when a question and its answer choices from the lesson plan are dynamically displayed in the `quiz` scene.
    *   **Quiz Answer Handling:** Done when clicking an answer checks correctness, updates quiz score, and proceeds to the next question or scene.
*   **Phase 4 — Learning Integration**
    *   **Resource Name Display:** Done when hovering over a resource temporarily displays its scientific name.
    *   **Photosynthesis Equation Display:** Done when the full photosynthesis equation briefly appears after successful photosynthesis.
    *   **Quiz Content Population:** Done when quiz questions are dynamically loaded from the GDD's assessment data.
    *   **Quiz Feedback System:** Done when correct/incorrect answers provide distinct visual and audio feedback.
*   **Phase 5 — UI & HUD**
    *   **Score Display:** Done when the score text updates dynamically in the `game` scene.
    *   **Timer Display:** Done when the timer text updates dynamically in the `game` scene.
    *   **Instructions:** Done when clear instructions are present on the `menu` screen.
    *   **Game-Over/Results Screen:** Done when the `results` scene accurately displays the final score and allows restarting.
*   **Phase 6 — Audio & Visual Polish**
    *   **Placeholder Sprites/Shapes:** Done when all game objects use the specified geometric shapes and colors.
    *   **Load Audio:** Done when all specified sound files are successfully loaded.
    *   **Background Music:** Done when cheerful background music plays on loop during gameplay.
    *   **Sound Effects:** Done when "pop" plays on collection, "ding" on correct answer, and "buzz" on incorrect.
    *   **O2 Bubble Animation:** Done when O2 bubbles animate upwards and fade out upon release.
    *   **Scene Transitions:** Done when scene changes are smooth, potentially with simple visual effects.
*   **Phase 7 — Edge Cases & Robustness**
    *   **Off-screen Resource Cleanup:** Done when no lingering off-screen resources cause performance issues.
    *   **Input Debouncing/Validation:** Done when rapid clicks do not cause unintended behavior.
    *   **Mobile/Touch Support:** Done when the game is playable and responsive on touch-enabled devices.
    *   **Game State Reset:** Done when starting a new game or level correctly resets all relevant game variables.
    *   **Quiz Progress:** Done when the game correctly progresses through quiz questions and transitions to the next level or results scene.