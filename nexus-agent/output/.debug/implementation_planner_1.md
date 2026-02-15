This technical plan outlines the visual transformation of the platformer template into a Civil War-themed educational game and the implementation of the "Fact-Check Bridge" mechanic.

### 1. Visual Reskin Plan

The goal is to move from a generic neon platformer to a "historical parchment" aesthetic.

#### **Global Visuals (CONFIG Object)**
*   **Background Color**: Change `CONFIG.bgColor` from dark blue to `[245, 235, 205]` (Parchment).
*   **Palette Swap**:
    *   `floorColor`: Level 1 (North) `[80, 50, 40]` (Industrial Brick); Level 2 (South) `[130, 90, 60]` (Southern Soil).
    *   `hazardColor`: `[80, 80, 80]` (Iron/Grey for Barbed Wire or Cannonballs).
    *   `coinColor`: `[184, 134, 11]` (Aged Gold for "Telegraph Keys").

#### **Character & Object Reskin**
*   **The Scout (Player)**: In `scene("game")`, modify the player creation. Instead of the default bean, add a `color(0, 50, 150)` (Union Blue) and `outline(2, rgb(0, 0, 0))` to signify the Union uniform.
*   **Telegraph Keys (Coins)**: Change "Coins" to "Messages" in `scoreLabel`. Replace the `circle(10)` in `buildLevel` (case `$`) with a `rect(16, 12)` to look like a telegraph key or a folded letter.
*   **Barbed Wire (Hazards)**: The `polygon` in `buildLevel` (case `^`) will remain, but the color change to metallic grey and the parchment background will make them look like sharp fortifications.
*   **The Peace Treaty (Portal)**: Change `CONFIG.portalColor` to `[255, 255, 255]` with a dark outline to represent an official document.

#### **HUD & UI Updates**
*   `hpLabel`: Change text to "Morale: ${hp}".
*   `scoreLabel`: Change text to "Messages: ${score}".
*   `levelLabel`: Level 1 becomes "The Industrial North"; Level 2 becomes "The Agrarian South".

---

### 2. Addon Mechanic Implementation Plan: Fact-Check Bridge

This mechanic will be implemented using a new tile symbol and a dynamic question-spawner.

#### **Step 1: Data Structure**
Define the historical content at the top of the script:
```javascript
const BRIDGES = [
  { 
    q: "Who was the President of the Union?", 
    a: { text: "Abraham Lincoln", isCorrect: true }, 
    b: { text: "Jefferson Davis", isCorrect: false } 
  },
  // Add more questions corresponding to the '?' symbols in map
];
```

#### **Step 2: Update Level Mapping**
*   Add two new symbols to the `LEVELS` array:
    *   `?`: The bridge trigger location.
    *   `S`: The "History Scroll" checkpoint.
*   Update `buildLevel` switch statement:
    *   **Case `S`**: Spawn a "History Scroll" object (rect with tag `"checkpoint"`).
    *   **Case `?`**: Spawn an invisible trigger area (rect with tag `"bridgeTrigger"`). Store an index `bridgeIdx` in the object.

#### **Step 3: Modify Scene Logic (scene "game")**
*   **Checkpoint System**:
    Add a collision handler for the scroll:
    ```javascript
    let currentSpawnPos = spawnPos; // Initialize with default
    player.onCollide("checkpoint", (s) => {
        currentSpawnPos = s.pos;
        // Visual feedback: Change scroll color or pop text
    });
    ```
    Update the `hazard` and `death plane` logic to use `player.pos = currentSpawnPos.clone()` instead of the original `spawnPos`.

*   **Bridge Trigger Logic**:
    When the player hits the `?`:
    1.  Spawn two platforms ahead of the trigger.
    2.  Use `platform.add([text(...)])` to attach the labels (Choice A and Choice B) to the physical platforms.
    3.  Tag them `"choice-correct"` and `"choice-wrong"` based on the `BRIDGES` data.

#### **Step 4: Collision Handling for Choices**
```javascript
player.onCollide("choice-wrong", (p) => {
    shake(10);
    destroy(p); // Platform vanishes
    // Player falls to the checkpoint below
});

player.onCollide("choice-correct", (p) => {
    p.color = rgb(0, 200, 0); // Turn green to show success
    // Platform stays solid (standard behavior)
});
```

---

### 3. Integration Checklist

*   **Scoring**: Landing on a correct platform should award +5 "Messages" (Score) to reward historical knowledge.
*   **Win/Lose**: If the player falls through an incorrect platform, they lose 1 Morale (HP). If Morale hits 0, they go to Game Over.
*   **Map Design**: The level designer must ensure a "History Scroll" checkpoint (`S`) is placed directly below every Fact-Check Bridge (`?`) so the player can recover and re-read the facts.
*   **Z-Index**: Ensure Choice labels (text) have `z(100)` so they are visible over the platforms.
*   **Scale**: Use `fixed()` for question prompts if you want them to appear as UI, or `pos()` relative to the bridge trigger to make them part of the world. For this lesson, floating text above the bridge is more immersive.