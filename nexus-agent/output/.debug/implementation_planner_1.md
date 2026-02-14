This technical plan transforms the standard shoot 'em up into **"Chloroplast Command,"** an educational game where students manage the inputs of photosynthesis while defending a leaf cell from pollution.

---

### 1. Visual Reskin Plan

#### Environment & Background
*   **Background Color**: Change `C.bg` from `[6, 6, 18]` (dark blue) to **`[10, 35, 15]`** (deep forest green) to represent the interior of a plant cell.
*   **Starfield (Cytoplasmic Flow)**: Rename `makeStars()` to `makeCellFlow()`.
    *   **Change**: Change star color from `[255, 255, 255]` to `[120, 200, 100]` (light green).
    *   **Change**: Change `circle(s)` to `rect(s, s)` to look like microscopic cell debris.
*   **HUD Text**: Change `hpTxt` color to `[150, 255, 150]`. Change heart symbol `@` to a leaf symbol `☘`.

#### Game Objects
*   **Player (Super Chloroplast)**: 
    *   **Now**: `sprite("bean")` with blue tint.
    *   **Become**: `sprite("bean")` with **`color(50, 200, 50)`** (bright green).
    *   **Scale**: Increase to `1.5` to look like a sturdy organelle.
*   **Enemies (Pollution & Pests)**:
    *   **Basic (Smog Cloud)**: Change color to `[100, 100, 100]` (Grey).
    *   **Fast (Pest/Aphid)**: Change color to `[200, 50, 50]` (Red).
    *   **Tank (Industrial Soot)**: Change color to `[40, 40, 40]` (Near-black) and increase size to `40x40`.
*   **Projectiles**:
    *   **Player Bullets (Energy)**: Change `C.bulletCol` to `[200, 255, 0]` (Bright Lime).
    *   **Enemy Bullets (Toxins)**: Change `C.enemyBulletCol` to `[180, 0, 255]` (Purple).

---

### 2. Addon Mechanic Implementation Plan: Photosynthesis Recipe Meter

#### A. State Management
In the `scene("game")`, initialize a state object to track the three inputs:
```javascript
let recipe = { sun: false, water: false, co2: false };
const recipeTotal = 3;
```

#### B. New Game Objects: Inputs & Outputs
Create a new function `spawnMolecules()` that triggers on a separate timer (similar to `spawnEnemy`).
*   **Inputs**:
    *   `Sunlight`: `circle(12)`, `color(255, 255, 0)`, tag: `"input"`, `{ type: "sun" }`
    *   `Water`: `circle(10)`, `color(0, 150, 255)`, tag: `"input"`, `{ type: "water" }`
    *   `CO2`: `circle(10)`, `color(150, 150, 150)`, tag: `"input"`, `{ type: "co2" }`
*   **Outputs (Hazards)**:
    *   `Oxygen`: `circle(12)`, `outline(2, [255, 255, 255])`, `opacity(0.6)`, tag: `"output"`
    *   `Glucose`: `polygon(...)` or `rect(15, 15)`, `color(255, 150, 0)`, tag: `"output"`

#### C. Collision Handlers (Player + Molecules)
Add these logic blocks to the `game` scene:
1.  **On Collide ("player", "input")**:
    *   Identify the type (e.g., `if (item.type === "sun") recipe.sun = true`).
    *   Play a "ding" sound effect.
    *   `destroy(item)`.
    *   Call `checkRecipe()`.
2.  **On Collide ("player", "output")**:
    *   **Penalty**: Briefly reduce player speed or trigger a 1-second "clogged" state where they cannot shoot.
    *   `destroy(item)`.

#### D. The Growth Pulse (The Addon Reward)
In the `checkRecipe()` function:
*   If `sun`, `water`, and `co2` are all `true`:
    1.  **Reset State**: Set all `recipe` keys back to `false`.
    2.  **Spawn Pulse**: Add a new object at the player's position:
        ```javascript
        const pulse = add([
            circle(10),
            pos(player.pos),
            area(),
            anchor("center"),
            color(255, 255, 255),
            opacity(1),
            "pulse"
        ]);
        // Animation: Expand to 1000px and fade out over 0.8 seconds
        pulse.tween(10, 1000, 0.8, (v) => pulse.radius = v, easings.easeOutExpo);
        pulse.animate("opacity", [1, 0], { duration: 0.8 });
        wait(0.8, () => destroy(pulse));
        ```
    3.  **Clear Screen**: `onCollide("pulse", "enemy", (p, e) => { destroy(e); score += 500; });`

#### E. Recipe UI Meter
Add three static icons at the top right of the screen:
*   Add a background "Meter Box" using `rect()`.
*   Add 3 icons (Yellow circle, Blue circle, Grey circle).
*   **Logic**: In the `updateHUD` function, update the `opacity` of these icons:
    *   `sunIcon.opacity = recipe.sun ? 1 : 0.2;` (Dim if not collected).

---

### 3. Integration Checklist

*   **Scoring Integration**: Every "Growth Pulse" kill awards 500 points (higher than standard kills) to encourage recipe completion.
*   **Win/Lose Adjustments**: 
    *   The "Output" molecules (Oxygen/Glucose) do not damage HP, but they act as obstacles that make it harder to dodge enemies.
    *   The "Growth Pulse" provides a brief moment of safety, allowing the player to recover if overwhelmed by smog clouds.
*   **Difficulty Scaling**: As `difficulty` increases, the speed of falling `Oxygen` and `Glucose` molecules increases, making it harder to maintain a clean "recipe."
*   **Edge Case**: If the player collects a duplicate input (e.g., two Sunlights), the second one should just grant a small score bonus without affecting the meter.