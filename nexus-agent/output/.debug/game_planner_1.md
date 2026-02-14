# Game Design Document: Photosynthesis Lab

## Core Concept

**Genre:** Drag-and-Drop Educational Puzzle  
**Description:** Students drag labeled inputs (sunlight, water, CO₂) to a plant to create outputs (oxygen, glucose) while learning the photosynthesis equation.  
**Target Play Time:** 3-5 minutes

## Learning Integration

**Objective 1 (Define photosynthesis):** Students see the complete equation and process explanation after each successful combination.

**Objective 2 (Identify inputs/outputs):** Core drag-and-drop mechanic requires students to match correct inputs to create specific outputs.

**Objective 3 (Explain importance):** Brief explanatory text appears when photosynthesis completes, emphasizing oxygen production and energy storage.

**Knowledge Check:** Quiz scene tests specific assessment questions about gases and energy source.

## Phaser Architecture

### Scenes
1. **MenuScene** - Instructions and start button
2. **GameScene** - Main photosynthesis simulation
3. **QuizScene** - 3-question assessment from lesson plan

### Key Game Objects
1. **Plant** (center rectangle with text label)
2. **Input Items** (labeled rectangles: "Sunlight", "Water", "CO₂")
3. **Output Display** (appears after correct combination)
4. **Score Counter** (tracks successful photosynthesis cycles)
5. **Instruction Text** (keyboard and mouse controls)

### Input System
- **Primary:** Keyboard navigation (arrow keys, spacebar, enter)
- **Secondary:** Mouse/touch drag-and-drop
- **Accessibility:** Full keyboard control with focus indicators

### Score Tracking
- +10 points per successful photosynthesis cycle
- Target: 10 cycles (100 points) to advance to quiz
- Progress bar shows completion status

## Assets Needed

**Graphics:** Programmatic shapes only
- Rectangles for plant, inputs, outputs
- Text labels on all interactive elements
- Focus outline for keyboard navigation
- Color + text for redundant visual coding

**Audio:** None (keeps scope minimal)

**Text:** 
- Input labels: "Sunlight", "Water", "CO₂"
- Output labels: "Oxygen", "Glucose"
- Brief explanation: "Plants use sunlight, water, and CO₂ to make food and oxygen for all life!"

## Accessibility Features

**Keyboard Navigation:**
- Arrow keys move focus between items
- Spacebar selects/drops items
- Enter confirms quiz answers
- Tab cycles through UI elements

**Visual Accessibility:**
- Text labels on ALL game objects
- High contrast focus outlines
- No color-only information
- Clear visual hierarchy

**Cognitive Support:**
- Simple, consistent interaction model
- Immediate feedback for all actions
- Progress tracking with clear goals
- Brief, clear instructions

## Scope Constraints

**Technical Limits:**
- Single HTML file under 500 lines
- Phaser 3 CDN only
- No external assets or build tools
- Programmatic graphics exclusively

**Content Limits:**
- One core mechanic (drag inputs to plant)
- Three quiz questions matching lesson assessment
- No animations or complex visual effects
- Focus on learning over entertainment complexity

**Design Philosophy:**
Every interaction directly supports photosynthesis understanding. If a feature doesn't teach the lesson objectives, it's removed.