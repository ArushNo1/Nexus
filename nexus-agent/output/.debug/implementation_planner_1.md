This technical plan details the visual reskinning and implementation of the "Chloroplast Charge" addon for the Kaplay.js **quizrunner** template, themed around **Photosynthesis**.

### 1. Visual Reskin Plan

The game is transformed from a generic runner into a vibrant garden ecosystem where a plant sprout must collect resources to bloom.

#### A. Constants & Environment (`const C`)
*   **Background Color**: Change `bg` to `[20, 40, 20]` (Deep Forest Green).
*   **Floor**: Update the floor `rect` color to `[60, 45, 30]` (Rich Soil Brown).
*   **Lane Lines**: Update `opacity` to `0.15` and color to `[100, 200, 100]` for a "viny" look.
*   **Player Color**: Change `playerCol` to `[50, 200, 50]` (Leaf Green).

#### B. Game Objects
*   **Player**: 
    *   Represented as a green rectangle with a larger radius (rounded like a seed/sprout).
    *   When in **Bloom State**, the color changes to `[255, 100, 200]` (Flower Pink) and `scale` increases by 1.2.
*   **Answer Blocks (Gates)**:
    *   **Neutral State**: Pale yellow/green `[200, 220, 150]`.
    *   **Correct (Input)**: Glowing bright yellow `[255, 255, 100]` (Sunlight) or Light Blue `[100, 200, 255]` (Water).
    *   **Wrong (Stressor)**: Dark Grey `[60, 60, 60]` (Smoke) or White-Grey `[200, 200, 200]` (Salt).
*   **Decorations**:
    *   Change `bgstar` to "Leaf" shapes or simple circles colored `[40, 80, 40]`.

#### C. Educational Content (`QUESTIONS`)
Update the array to focus on inputs/outputs:
1.  "What does a plant need from the Sun?" -> `["Sunlight", "Oxygen", "Salt"]`, Correct: 0.
2.  "Which gas do plants 'breathe' in?" -> `["Nitrogen", "Carbon Dioxide", "Hydrogen"]`, Correct: 1.
3.  "Plants drink this through their roots:" -> `["Soda", "Vinegar", "Water"]`, Correct: 2.
4.  "What sugar do plants make for food?" -> `["Glucose", "Salt", "Lactose"]`, Correct: 0.

---

### 2. Addon Mechanic: The Chloroplast Charge

#### A. State Variables
Add these to the top of the `scene("game")`:
```javascript
let charge = 0;          // 0 to 100
let isBlooming = false;  // State flag
const CHARGE_GAIN = 34;  // 3 correct answers to fill meter
```

#### B. The Chloroplast Meter (UI)
In the HUD section of `scene("game")`:
*   Add a background container: `rect(100, 20)` at `pos(8, 50)`, color `[0, 0, 0]`.
*   Add the fill bar: `rect(0, 16)` at `pos(10, 52)`, color `[0, 255, 0]`, tag `"chargeBar"`.

#### C. Bloom Logic Implementation
1.  **Update Charge**: Inside `onCollide("player", "answerblock")`, if `block.isCorrect` is true:
    *   Increment `charge += CHARGE_GAIN`.
    *   If `charge >= 100` and `!isBlooming`, call a new function `startBloom()`.
2.  **`startBloom()` function**:
    *   Set `isBlooming = true`.
    *   Tween player scale and change color to pink.
    *   Start a `loop(0.2)` to spawn **Glucose Coins** and **Oxygen Trails**.
    *   Use `wait(5)` to call `endBloom()`.
3.  **Oxygen Trails**: 
    *   During Bloom, spawn circles with `pos(player.pos)`, `lifespan(0.5, {fade: 0.2})`, `opacity()`, and `move(LEFT, 100)`. This visually shows the plant releasing oxygen.

#### D. Glucose Coins (Magnetic Collection)
1.  **Spawn**: In the Bloom loop, add a "glucose" object: `circle(8), color(255, 255, 0), area(), pos(width() + 20, rand(laneYs[0], laneYs[2])), "glucose"`.
2.  **Attraction Logic**: In `onUpdate("glucose")`:
    ```javascript
    const dir = player.pos.sub(g.pos).unit();
    g.move(dir.scale(C.scrollSpeed * 2)); // Move towards player faster than scroll
    ```
3.  **Collection**: `onCollide("player", "glucose", (p, g) => { destroy(g); score += 50; })`.

---

### 3. Integration Checklist

*   **Scoring**: Correct answers still give 100 pts. Glucose coins collected during Bloom give 50 pts bonus.
*   **Win Condition**: Ensure the game doesn't end while in Bloom state if the last question was just answered (add a small `wait` if `isBlooming` is true).
*   **Visual Feedback**:
    *   The `chargeBar` width should be updated in `onUpdate`: `get("chargeBar")[0].width = lerp(get("chargeBar")[0].width, charge, dt() * 10)`.
*   **Edge Cases**:
    *   If a player hits a "Wrong" gate during Bloom, they should still lose HP and potentially end Bloom early as a penalty (Environmental Stress).
    *   Use `opacity()` on all trail/particle objects to prevent crashes with `lifespan()`.
    *   Ensure Glucose coins are destroyed if they go off-screen to the left to prevent memory leaks.