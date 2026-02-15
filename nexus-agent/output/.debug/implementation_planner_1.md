This technical plan outlines the visual transformation and mechanic implementation to turn the platformer template into a **Valentine's Day History** educational game.

### 1. Visual Reskin Plan

The game will progress through four distinct historical eras. We will update the `CONFIG` colors and object visuals dynamically based on the `levelIdx`.

#### A. Environmental Themes
| Era (Level) | Ground Color (`floorColor`) | Platform Color (`platformColor`) | Background Theme |
| :--- | :--- | :--- | :--- |
| **0: Ancient Rome** | `[240, 240, 230]` (Marble) | `[218, 165, 32]` (Gold) | Roman pillars & temple silhouettes |
| **1: Middle Ages** | `[100, 100, 110]` (Stone) | `[139, 69, 19]` (Wood) | Castle battlements & parchment sky |
| **2: Industrial Era**| `[70, 40, 30]` (Dark Wood) | `[200, 150, 200]` (Lace) | Victorian parlors & printing shops |
| **3: Modern Day** | `[255, 182, 193]` (Pink) | `[255, 105, 180]` (Hot Pink)| Candy shop & floating hearts |

#### B. Character & Entity Swaps
*   **Player Character (`player`)**: 
    *   Change `sprite("bean")` to a new sprite labeled `"messenger"`. 
    *   Visual: A character with a brown satchel and a red hat.
*   **Hazards (`hazard`)**: 
    *   **Level 0**: "Roman Soldier" (Red polygon triangle).
    *   **Level 1**: "Medieval Crow" (Black polygon).
    *   **Level 2**: "Printing Press" (Grey rectangle with `outline()`).
    *   **Level 3**: "Commercial Mascot" (Yellow circle).
*   **Collectibles**: 
    *   Replace `circle(10)` (coins) with `rect(15, 20)` (scrolls/letters).
    *   **Level 0**: White scrolls with gold ribbons.
    *   **Level 1**: Parchment paper.
    *   **Level 2**: Lace-trimmed envelopes.
    *   **Level 3**: Heart-shaped chocolate boxes.

---

### 2. Addon Mechanic Implementation: Era-Authentic Collection

We will implement a system where the player must collect 3 specific artifacts per level to unlock the exit portal.

#### A. Data Structure
Define an array of artifact data to be used by the `scene("game")`:
```javascript
const ERA_DATA = [
    {
        name: "Ancient Rome",
        artifacts: [
            { title: "Marriage Scroll", desc: "St. Valentine secretly married couples." },
            { title: "Roman Decree", desc: "Emperor Claudius II banned marriages." },
            { title: "Jailer's Letter", desc: "The first 'Valentine' signed by the Saint." }
        ]
    },
    // ... Repeat for Middle Ages, Industrial, Modern
];
```

#### B. Modified `buildLevel` Logic (Section 6)
Update the `$` (Coin) case in `buildLevel`:
*   Change tag from `"coin"` to `"artifact"`.
*   Assign an index (0, 1, or 2) to each artifact object so it knows which piece of lore to display.
*   The template currently spawns many `$` symbols; for this mechanic, the level maps should be updated to have exactly three `$` symbols.

#### C. State Variables (Section 7)
Inside `scene("game")`, add:
*   `let artifactsCollected = 0;`
*   `const totalArtifacts = 3;`

#### D. Collision & Popup Logic
Modify the player collision handler:
1.  **On Artifact Collection**:
    ```javascript
    player.onCollide("artifact", (a) => {
        destroy(a);
        artifactsCollected++;
        
        // Logic to show popup
        const data = ERA_DATA[levelIdx].artifacts[artifactsCollected - 1];
        showHistoricalPopup(data.title, data.desc);
        
        // Update HUD
        artifactLabel.text = `Artifacts: ${artifactsCollected}/3`;
    });
    ```
2.  **Historical Popup Function**:
    Add a helper function within the game scene:
    ```javascript
    function showHistoricalPopup(title, desc) {
        const panel = add([
            rect(400, 100, { radius: 8 }),
            pos(width() / 2, height() - 80),
            anchor("center"),
            color(255, 255, 255),
            outline(4, rgb(255, 100, 100)),
            fixed(),
            opacity(), // Required for lifespan fade
            lifespan(4, { fade: 1 }), // Stays for 4 seconds, fades out at the end
            z(200)
        ]);

        panel.add([
            text(`${title}: ${desc}`, { size: 16, width: 380 }),
            anchor("center"),
            color(0, 0, 0),
        ]);
    }
    ```

#### E. Portal Locking (Section 7)
Modify the `portal` collision:
```javascript
player.onCollide("portal", () => {
    if (artifactsCollected >= totalArtifacts) {
        const nextLevel = levelIdx + 1;
        if (nextLevel < LEVELS.length) {
            go("game", nextLevel);
        } else {
            go("win", { score });
        }
    } else {
        shake(4);
        showHistoricalPopup("Locked", "Collect all 3 artifacts to travel through time!");
    }
});
```

---

### 3. Integration Checklist

*   **HUD Update**: Rename `scoreLabel` to `artifactLabel` and change text to `"Artifacts: 0/3"`.
*   **Color Persistence**: Update `CONFIG.bgColor` and `CONFIG.floorColor` at the start of `scene("game")` based on `levelIdx` to ensure the visual theme matches the historical era.
*   **Level Map Adjustment**: Ensure each level in the `LEVELS` array contains exactly three `$` symbols to match the "3 Artifacts" requirement.
*   **Artifact Components**: Every artifact object must include `opacity()` if using `lifespan()` for its destruction effects, and the popup panel must include `opacity()` to support the `{ fade: 1 }` option in its `lifespan` component.
*   **Win Condition**: The game only transitions to the "Win" scene after the Modern Day (Level 3) portal is entered with 3 artifacts.