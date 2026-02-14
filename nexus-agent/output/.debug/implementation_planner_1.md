This technical plan outlines the transformation of the Maze template into a photosynthesis-themed educational game where the player navigates a plant cell to gather life-sustaining inputs.

### 1. Visual Reskin Plan

**Theme: Microscopic Leaf Cell**

| Existing Object | Reskinned To | Exact Changes |
| :--- | :--- | :--- |
| **Player (Bean)** | **Sunny the Seedling** | Change `sprite("bean")` to a green `circle(12)` or custom seedling sprite. Change `C.playerCol` to `[100, 255, 100]` (Lime Green). |
| **Ghosts (Rect)** | **Pollution Clouds / Aphids** | Use `circle(12)` with `C.ghostCols` adjusted to muddy greys `[100, 100, 100]` and deep insect reds `[150, 0, 0]`. Use `radius: 4` for a more organic look. |
| **Walls (#)** | **Cell Wall Structure** | Change `C.wallCol` to `[20, 80, 20]` (Dark Forest Green). Change `outline` to `[40, 120, 40]`. |
| **Dots (.)** | **Nutrient Pellets** | Change `C.dotCol` to `[200, 255, 200]` (Light Green). |
| **Power Pellets (o)** | **Chlorophyll Molecules** | Change `C.powerCol` to `[0, 200, 0]` (Pure Green). Add a `rotate()` component with `onUpdate(() => pellet.angle += dt() * 100)`. |
| **Background** | **Cytoplasm** | Change `C.bg` to `[10, 40, 10]` (Deep Green). |
| **HUD Text** | **Photosynthesis Stats** | "Score" becomes "Glucose Produced". "Lives" becomes "Hydration". "Power" becomes "OXYGEN BLAST!". |

---

### 2. Addon Mechanic Implementation Plan: Photosynthesis Formula Bar

This mechanic requires the player to collect three specific items (Water, Sunlight, CO2) to trigger a power-up.

#### Step 1: Define New State & Constants
Add these to the `scene("game")` scope:
- **State variables**: `const formula = { water: false, sun: false, co2: false };`
- **Total collected count**: `let formulaCount = 0;`
- **HUD reference**: A progress bar container at the top of the screen.

#### Step 2: Spawn Formula Components
In the "MAZE BUILDER" loop, replace or add logic to spawn one-time items.
- Modify the ASCII maze `MAZES` to include new characters: `W` (Water), `S` (Sunlight), `C` (CO2).
- Inside the `switch(ch)` block:
    - **Case 'W'**: `add([circle(8), color(0, 100, 255), pos(x+T/2, y+T/2), area(), "water"])`
    - **Case 'S'**: `add([circle(8), color(255, 255, 0), pos(x+T/2, y+T/2), area(), "sun"])`
    - **Case 'C'**: `add([circle(8), color(150, 150, 150), pos(x+T/2, y+T/2), area(), "co2"])`

#### Step 3: Collection Logic & Formula Bar Update
Add collision handlers for the new tags:
```javascript
// Example for one component (repeat for sun and co2)
player.onCollide("water", (w) => {
    destroy(w);
    formula.water = true;
    formulaCount++;
    checkFormula();
});

function checkFormula() {
    updateFormulaUI();
    if (formula.water && formula.sun && formula.co2) {
        // Trigger Oxygen Blast
        powered = true;
        powerTimer = C.powerUpTime;
        // Reset formula for next cycle
        formula.water = formula.sun = formula.co2 = false;
        formulaCount = 0;
        shake(5); // Visual feedback
    }
}
```

#### Step 4: The Formula Bar UI
Create a visual bar in the HUD area (adjust `hudY` or add to the top):
- Add a background `rect` (grey) for the bar.
- Add three segment `rects` inside it.
- In `updateFormulaUI()`, change the color of the segments from `grey` to their respective colors (Blue, Yellow, White) when `formula.water`, etc., are true.

#### Step 5: Integration with Existing Mechanics
- **Ghost Transformation**: In the `ghost.onUpdate` logic where `powered` is checked, change the scared color to a "Glucose" appearance (white/sugar-crystal-like).
- **Scoring**: In the `player.onCollide("ghost")` handler, if `powered`, change the floating text or log to say "+200 Glucose".

---

### 3. Integration Checklist

*   **Win Condition**: Ensure `totalDots` includes the Water/Sun/CO2 items so the level doesn't end before they are collected.
*   **Collision Layers**: Set `z(10)` for formula items to ensure they appear above the nutrient pellets.
*   **UI Layout**: Adjust the `kaplay` height or move the `hudY` calculation to accommodate both the formula bar at the top and the existing stats at the bottom.
*   **Reset Logic**: When the player loses a life, the formula progress should remain (to avoid frustration), but the player is reset to `playerSpawn`.
*   **Visual Feedback**: When the formula is finished, use `addKaboom(player.pos)` but tinted light blue to represent the "Oxygen Blast."