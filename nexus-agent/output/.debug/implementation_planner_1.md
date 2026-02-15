This technical plan outlines the visual transformation of the Platformer template into a Civil War history game and the implementation of the "Legislative Dispatch" sorting mechanic.

### 1. Visual Reskin Plan

Every visual element will be updated to reflect the 1860s historical context.

| Object | Template Default | New Civil War Theme | Visual Details |
| :--- | :--- | :--- | :--- |
| **Player** | `sprite("bean")` | **History Scout** | Blue rectangle (Union Cap) `[0, 50, 150]` with a smaller tan square `[210, 180, 140]` for the face. |
| **Ground (=)** | `CONFIG.floorColor` | **Industrial/Agrarian Soil** | **Lvl 1:** Dark Brick `[130, 50, 50]`. **Lvl 2:** Plantation Soil `[100, 70, 40]`. |
| **Platforms (-)** | `CONFIG.platformColor` | **Wooden Scaffolding** | Light Brown `[180, 140, 100]` with `outline(2)` for a plank look. |
| **Coins ($)** | `circle(10)` (Yellow) | **Fact Scrolls** | White `[255, 255, 240]` rectangles `rect(20, 10)` with a small tan "ribbon" detail. |
| **Hazards (^)** | `polygon(...)` (Red) | **Policy Spikes** | Dark Metallic Grey `[60, 60, 60]` representing sharp political divides. |
| **Portal (>)** | `rect(...)` (Purple) | **Telegraph Station** | Iron-grey metallic tower `[80, 80, 90]` with a pulsing yellow light `opacity(0.8)`. |
| **Background** | `CONFIG.bgColor` | **War Horizon** | **Lvl 1 (North):** Smoke Grey `[100, 105, 110]`. **Lvl 2 (South):** Sunset Orange/Dusty Yellow `[200, 150, 100]`. |
| **HUD Labels** | "Coins", "HP" | **"Unity", "Facts"** | "Unity" (HP) in Blue; "Facts Collected" in Gold. |

---

### 2. Addon Mechanic Implementation Plan: The Legislative Dispatch

The "Legislative Dispatch" requires players to collect scrolls containing historical facts and sort them correctly before the Telegraph Station (exit) activates.

#### A. Data Structure
Define the facts associated with each level at the top of the script:
```javascript
const FACT_DATA = [
    { level: 0, facts: [
        { text: "Larger population and more factories.", side: "Union" },
        { text: "Primary labor force was enslaved people.", side: "Confederacy" },
        { text: "Wanted to preserve the Union.", side: "Union" }
    ]},
    // Add facts for Level 1...
];
```

#### B. Collection Logic (Scene: "game")
- **State:** Initialize an empty array `collectedFacts` at the start of the `game` scene.
- **Modification:** In `player.onCollide("coin", ...)`, instead of just incrementing a number:
    1. Determine which fact to award based on `collectedFacts.length`.
    2. Push that fact object into the `collectedFacts` array.
    3. Update `scoreLabel.text = "Facts: " + collectedFacts.length + "/" + totalLevelFacts`.

#### C. The Sorting Terminal (Transition Logic)
Modify the `player.onCollide("portal", ...)` handler:
1. **Check Completion:** If `collectedFacts.length < totalLevelFacts`, display a temporary floating message: "Return to collect all Fact Scrolls!" (Use `pos()`, `text()`, `lifespan(2)`, and `opacity()`).
2. **Transition:** If complete, instead of `go("game", nextLevel)`, call `go("sorting", { facts: collectedFacts, nextLevel: levelIdx + 1 })`.

#### D. The Sorting Scene (New Scene: "sorting")
Create a new scene `scene("sorting", ({ facts, nextLevel }))`:
1. **Bins:** Add two large `rect()` areas labeled "UNION" (Left) and "CONFEDERACY" (Right).
2. **Scrolls:** Loop through the `facts` array and spawn a `rect` for each fact with a `text()` component showing the historical statement.
3. **Interactive Logic:** 
    - Each fact object has an `assignedSide` property (initially null).
    - Use `.onClick()` on the fact objects to cycle their state: `Unassigned` -> `Union` -> `Confederacy`.
    - Change the color of the fact object based on selection (e.g., Blue for Union, Grey for Confederacy).
4. **Validation:** Add a "SEND DISPATCH" button.
    - When clicked, check if `fact.assignedSide === fact.side` for every collected scroll.
    - **If Correct:** Play a success sound/effect and `go("game", nextLevel)`.
    - **If Incorrect:** `shake(10)` and show a message: "Historical inaccuracies detected in dispatch!"

---

### 3. Integration Checklist

- [ ] **Background Swap:** Ensure `kaplay({ background: ... })` or a full-screen `rect` is updated when `levelIdx` changes to distinguish North from South.
- [ ] **Scroll Logic:** The number of `$` symbols in the `LEVELS` array must exactly match the number of facts defined in `FACT_DATA` for that level index.
- [ ] **UI Layering:** The sorting scene must use `z(100)` for the text to ensure the historical facts are readable over the bin backgrounds.
- [ ] **Sorting UI Layout:** Use `text({ width: 300 })` to wrap long historical facts so they fit within the sorting scroll UI.
- [ ] **Persistence:** Ensure `collectedFacts` is reset for every new level, but `totalScore` persists if desired.
- [ ] **Safe Destruction:** Any floating messages or particles must include the `opacity()` component to work correctly with `lifespan()`.