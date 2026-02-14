# Game Design Document: Photosynthesis Factory

## Core Concept

**Genre:** Resource Collection + Quiz  
**Description:** Players drag sunlight, water, and CO2 to a plant to create oxygen and glucose, then answer questions about the process.  
**Target Play Time:** 3-4 minutes per session

## Learning Integration

**Objective Mapping:**
- **Define photosynthesis:** Opening instruction text explains the process
- **Identify inputs/outputs:** Core mechanic requires dragging correct inputs (sunlight, water, CO2) to produce outputs (oxygen, glucose)
- **Explain importance:** Quiz questions reinforce why photosynthesis matters for life

**Knowledge Checks:**
1. **Mechanic-based:** Successfully combine 3 inputs to produce 2 outputs (immediate feedback)
2. **Quiz validation:** 3 multiple-choice questions after gameplay session

## Phaser Architecture

**Scenes (2 total):**
1. **GameScene:** Main photosynthesis factory gameplay
2. **QuizScene:** Post-game knowledge check (3 questions)

**Key Game Objects:**
- **Plant:** Central green rectangle that accepts inputs
- **Input items:** Draggable circles (yellow sun, blue water drop, gray CO2)
- **Output items:** Appear when recipe is complete (green oxygen, orange glucose)
- **Score display:** Tracks successful photosynthesis cycles

**Input:** Mouse/touch only - drag and drop mechanics  
**Score:** Count of completed photosynthesis cycles (target: 5-10 cycles)

## Game Flow

1. **GameScene starts:** Instructions appear briefly
2. **Gameplay loop:** 
   - 3 input items spawn randomly on screen edges
   - Player drags all 3 to the plant (order doesn't matter)
   - Plant glows, outputs appear, score increases
   - New inputs spawn for next cycle
3. **After 10 cycles or 2 minutes:** Transition to QuizScene
4. **QuizScene:** 3 multiple-choice questions, show final score

## Assets Needed

**Visual Elements (Programmatic Only):**
- Plant: Green rectangle with simple leaf shapes
- Sun: Yellow circle with radiating lines
- Water: Blue teardrop shape
- CO2: Gray circle with "CO2" text
- Oxygen: Green circle with "O2" text
- Glucose: Orange hexagon with "C6H12O6" text

**Audio:** None (keeps scope minimal)

**Text:**
- Instructions: "Drag sunlight, water, and CO2 to the plant!"
- Quiz questions from lesson plan assessment
- Success feedback: "Photosynthesis complete!"

## Scope Constraints

**Technical:**
- Single HTML file, ~400 lines of code
- Phaser 3 CDN implementation
- All graphics drawn with `this.add.graphics()`
- Simple drag/drop physics using Phaser's input system

**Content:**
- Exactly 3 quiz questions (from lesson plan)
- 5-10 photosynthesis cycles per game
- Binary success/fail feedback (no complex scoring)

**Avoided Complexity:**
- No animations beyond simple scaling/glowing
- No multiple levels or difficulty progression
- No save/load functionality
- No complex particle effects

This design directly maps the three lesson objectives to core mechanics while maintaining the simplest possible implementation that still provides educational value.