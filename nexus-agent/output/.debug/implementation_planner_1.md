This technical plan outlines the transformation of the Kaplay platformer template into an educational game about the American Civil War, featuring the "Historical Fact Gates" mechanic.

### 1. Visual Reskin Plan

To align with the American Civil War theme, we will modify the `CONFIG` object and the `buildLevel` visual components.

**A. Color Palette & UI (in `CONFIG`):**
*   **Background (`bgColor`)**: Change to `[45, 55, 75]` (a somber, dusky blue sky).
*   **Floor/Ground (`floorColor`)**: Change to `[101, 67, 33]` (earthy brown for dirt paths and mud).
*   **Platforms (`platformColor`)**: Change to `[139, 69, 19]` (weathered wood for barricades).
*   **Hazards (`hazardColor`)**: Change to `[60, 60, 60]` (iron/steel for cannons and spikes).
*   **Collectibles (`coinColor`)**: Change to `[245, 245, 220]` (parchment/paper color for Abolitionist Pamphlets).
*   **UI Labels**: 
    *   Change "HP" to "MORALE".
    *   Change "Coins" to "PAMPHLETS".

**B. Game Objects (in `buildLevel` and `scene("game")`):**
*   **Player Character**:
    *   **Current**: `sprite("bean")`
    *   **New**: A Union Soldier. Use a `rect` with color `[0, 35, 102]` (Union Blue) and a secondary gold detail `[218, 165, 32]` representing buttons.
*   **Collectibles (`$`)**:
    *   **Current**: `circle(10)`
    *   **New**: `rect(16, 22)` with color `[245, 245, 220]` and `outline(1)` to look like a folded pamphlet.
*   **Hazards (`^`)**:
    *   **Current**: `polygon` (spikes)
    *   **New**: Keep `polygon` but set color to `[60, 60, 60]` and label them as "Iron Spikes/Barricades."
*   **Exit Portal (`>`)**:
    *   **Current**: Purple rectangle.
    *   **New**: A tall vertical pole (`rect(4, 64)`) with a Union Flag (`rect(32, 20)`) at the top using colors `[200, 0, 0]` and `[255, 255, 255]`.

---

### 2. Addon Mechanic Implementation Plan: Historical Fact Gates

This feature introduces gates that require a correct historical choice to pass.

**A. Data Structure**
Define a `FACTS` array to store the educational content:
```javascript
const FACTS = [
    { 
        q: "What was a main cause of the war?", 
        options: ["Slavery", "Expansion of Trade"], 
        correct: 0 
    },
    { 
        q: "Which side was Abraham Lincoln on?", 
        options: ["Confederacy", "Union"], 
        correct: 1 
    }
];
```

**B. Level Map Integration**
Add new symbols to the `LEVELS` array:
*   `|`: The physical Gate (blocking the path).
*   `[`: Left Choice Banner.
*   `]`: Right Choice Banner.

**C. `buildLevel` Modifications**
Add cases to handle the new symbols:
*   **Gate (`|`)**: A tall static body using `rect(10, TILE * 3)` with tag `"gate"`.
*   **Banners (`[` and `]`)**: 
    *   Create objects with tags `"banner"` and attributes `{ side: "left" }` or `{ side: "right" }`.
    *   Use `text()` component to display the current question's options from the `FACTS` array.
    *   **Visual**: A vertical hanging rectangle with text centered on it.

**D. State Management (in `scene("game")`)**
*   Initialize `let currentGateIdx = 0;` to track which question is currently active.

**E. Event Handlers**
Implement collision logic for the banners:
1.  **Collision Handler**: `player.onCollide("banner", (b) => { ... })`
2.  **Logic**:
    *   Check if the choice is correct: `(b.side === "left" && FACTS[currentGateIdx].correct === 0) || (b.side === "right" && FACTS[currentGateIdx].correct === 1)`.
    *   **If Correct**:
        *   `destroyAll("gate")` or `get("gate").forEach(g => g.destroy())`.
        *   Play a success sound/effect.
        *   Increment `currentGateIdx`.
    *   **If Incorrect**:
        *   Spawn a **"Skirmish"**: `add([rect(20, 20), color(150, 0, 0), pos(player.pos.x + 200, player.pos.y), area(), body(), "enemy", "hazard", opacity(1)])`.
        *   Display a temporary message using `lifespan()` and `opacity()` (as required):
            `add([text("INCORRECT - REGROUP!", {size: 14}), pos(player.pos), lifespan(2), opacity(1)])`.
        *   Knock the player back slightly.

---

### 3. Integration Checklist

*   **Scoring**: Collecting "Pamphlets" ($) increases the score. Correct Gate choices should award a large score bonus (e.g., +10 Pamphlets).
*   **Win/Lose Conditions**:
    *   Losing Morale (HP) leads to "Game Over" (Retreat).
    *   Reaching the Flagpole (Portal) at the end of the final level leads to "Victory" (Reconstruction).
*   **Mechanic Adjustments**:
    *   The camera interpolation in `CONFIG.cameraFollow` might need to be adjusted if the Gate text is too large to see. Use `camScale(0.8)` when approaching a gate to give the player a wider view of the banners.
*   **Edge Cases**:
    *   If the player jumps through a banner multiple times: Use a local variable `gateActive = true` to prevent multiple spawns or multiple score awards for the same gate.
    *   **Lifespan Usage**: Assert that every temporary alert or spawned enemy used with `lifespan()` also includes the `opacity()` component to ensure the engine handles the destruction correctly.
    *   **Text Wrapping**: Use the `width` property in the `text()` component for banners (e.g., `text(opt, { width: TILE * 3 })`) to ensure long historical facts wrap within the banner boundaries.