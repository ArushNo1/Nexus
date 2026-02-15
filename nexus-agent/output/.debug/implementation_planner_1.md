This technical plan outlines the transformation of the base platformer template into a **Digital Testing Lab** game featuring the **Knowledge Gate** mechanic.

### 1. Visual Reskin Plan

To achieve the "Digital Testing Lab" aesthetic, we will replace the organic colors with high-contrast neon palettes and add geometric details.

**A. Color Palette & Environment (CONFIG Object)**
*   **Background**: Change `bgColor` to `[10, 10, 25]` (Deep Midnight).
*   **Ground/Walls**: Change `floorColor` to `[0, 255, 255]` (Neon Cyan).
*   **Platforms**: Change `platformColor` to `[255, 0, 255]` (Neon Magenta).
*   **Hazards**: Change `hazardColor` to `[255, 50, 50]` (Glitch Red).
*   **Coins**: Change `coinColor` to `[255, 255, 0]` (Data Yellow).

**B. Game Objects**
*   **Player (Data Probe)**:
    *   Instead of just `sprite("bean")`, add a `rect` child or `outline(2, rgb(255, 255, 255))` to give it a robotic glow.
    *   Scale it down to `0.8` for a "compact drone" look.
*   **Hazards (Corrupted Files)**:
    *   Replace `polygon` spikes with `rect(TILE, TILE)` blocks.
    *   Add a `shake()` or `opacity()` flicker in an `onUpdate` loop to simulate "glitching."
*   **Coins (Data Bits)**:
    *   Change `circle(10)` to `rect(12, 12, { radius: 2 })` and rotate by 45 degrees (diamond shape).
*   **HUD**:
    *   Rename "Coins" to "Data Bits".
    *   Use a monospace font if available or keep default with `size: 16` for a terminal feel.

---

### 2. Addon Mechanic Implementation: The Knowledge Gate

The Knowledge Gate consists of two portals at the end of each level. One represents the correct answer and the other represents the incorrect one.

#### A. Data Structure
Add a constant `QUESTIONS` array before the `LEVELS` array to store lesson content.
```javascript
const QUESTIONS = [
    { 
        q: "Which tag groups objects?", 
        a: "Tags", // Correct
        b: "Names", // Incorrect
        correct: "a" 
    },
    // ... one for each level
];
```

#### B. Level Map Updates
Modify the `LEVELS` maps to remove the single `>` and add two specific symbols for the gates:
*   `1`: Correct Portal
*   `2`: Incorrect Portal

Example Level End:
```text
"          1  2   "
"         ======  "
```

#### C. Build Level Modification
In the `buildLevel(mapData)` function, add cases for symbols `1` and `2`:
1.  **Tagging**: Give them tags `"portal"` and a specific identifier (e.g., `"gateA"`, `"gateB"`).
2.  **Labels**: Add a child text object to each portal using `obj.add([text(...)])` to display Answer A or Answer B from the `QUESTIONS` array.

#### D. Logic Implementation (Inside `scene("game")`)
Replace the existing `player.onCollide("portal", ...)` handler with the following logic:

1.  **Collision Check**:
    *   When player hits a portal, identify if it is the "correct" portal based on `QUESTIONS[levelIdx].correct`.
2.  **Correct Path**:
    *   If correct: Play a "success" sound/visual and call `go("game", levelIdx + 1)`.
3.  **Incorrect Path (The Reboot)**:
    *   If incorrect: 
        *   Trigger `shake(10)` and a brief `flash(rgb(255,0,0), 0.2)`.
        *   Reset `player.pos = spawnPos`.
        *   Optional: Subtract a small amount of score as a penalty.

#### E. Code Hints
*   **Adding Child Text**: Use `gate.add([text(answerText, { size: 12 }), pos(0, -20), anchor("center")])`.
*   **Detecting Gate Type**: Use custom properties during `add()`: `add([ ..., "portal", { isGateA: true } ])`.

---

### 3. Integration Checklist

*   **Scoring**: The "Data Bits" (coins) collected throughout the level are preserved even if the player hits the wrong gate and reboots. This rewards exploration while the gates test knowledge.
*   **Win/Lose Conditions**:
    *   The Knowledge Gate acts as the only way to trigger `nextLevel`.
    *   The "Corrupted Files" (hazards) still reduce HP. If HP hits 0, it's a hard "Game Over." If a gate is wrong, it's just a "soft reset" (reboot).
*   **Camera**: Ensure the camera is wide enough at the end of the level so the player can clearly see both gates and their labels before choosing.
*   **Edge Case**: If the player jumps and hits the side of the portal instead of the front, ensure the `area()` component is large enough to trigger the collision reliably. Use `anchor("bot")` for gates to keep them flush with the floor.