# Game Design Document: Photosynthesis Factory

## Core Concept
- **Genre:** Drag-and-drop puzzle with factory simulation elements
- **Description:** Students manage a plant "factory" by dragging the correct inputs (sunlight, water, CO₂) to create outputs (oxygen, glucose) while learning the photosynthesis process
- **Target play time:** 3-4 minutes per session

## Learning Integration
- **Objective 1** (Define photosynthesis): Reinforced through interactive tutorial and success messages that explicitly state "This is photosynthesis - plants making their own food!"
- **Objective 2** (Identify inputs/outputs): Core drag-and-drop mechanic requires recognizing and correctly placing all 3 inputs to generate 2 outputs
- **Objective 3** (Explain importance): Success feedback connects plant oxygen production to "the air we breathe" and glucose to "plant food for growth"

**Knowledge Checks:**
1. **Recognition test:** Players must identify correct input shapes/labels before dragging
2. **Process understanding:** Only complete input combinations (sun + water + CO₂) produce outputs, teaching the requirement for all three

## Phaser Architecture

### Scenes
1. **MenuScene:** Instructions with accessibility options toggle
2. **GameScene:** Main factory gameplay (60-second timer)

### Key Game Objects
1. **InputDropper:** Generates falling input items (sun, water drop, CO₂ bubble)
2. **Plant:** Central factory that accepts inputs and produces outputs
3. **ScoreManager:** Tracks correct combinations and provides educational feedback
4. **AccessibilityManager:** Handles keyboard navigation and visual alternatives

### Input System
- **Primary:** Mouse drag-and-drop
- **Accessibility Alternative:** Arrow keys to select items + WASD to move + Spacebar to drop
- **Visual Focus:** Clear selection borders for keyboard users

### Score Tracking
- +10 points per correct input placement
- +50 bonus for complete photosynthesis cycle (all 3 inputs → both outputs)
- Educational pop-ups explain each successful combination

## Assets Needed

### Graphics (Programmatic Only)
- **Sun:** Yellow circle with triangular rays
- **Water:** Blue teardrop shape using arc curves
- **CO₂:** Gray circle with "CO₂" text label
- **Plant:** Green rectangle "stem" with circle "leaves"
- **Oxygen:** Light blue circle with "O₂" text
- **Glucose:** Brown hexagon with "C₆H₁₂O₆" text

### Accessibility Features
- **Shape differentiation:** Each element has unique geometric shape beyond color
- **High contrast mode:** Black outlines on all shapes, white text on dark backgrounds
- **Text sizing:** Minimum 16px font size, scalable to 24px
- **Focus indicators:** Thick yellow borders for keyboard selection

### Audio (Optional)
- Gentle "whoosh" for successful drops
- Cheerful chime for complete cycles
- Narrated instructions for screen reader compatibility

## Scope Constraints

### Technical Limits
- **File size:** Single HTML file, estimated 450-500 lines
- **Framework:** Phaser 3 via CDN only
- **Graphics:** No external images - shapes drawn with Phaser.GameObjects.Graphics
- **Data:** No external JSON - all content hardcoded in arrays

### Accessibility Compliance
- **WCAG 2.1 AA:** Minimum 4.5:1 contrast ratio for all text
- **Keyboard navigation:** Full game playable without mouse
- **Motor accessibility:** Adjustable drag sensitivity, click-to-place alternative
- **Cognitive accessibility:** Clear instructions, consistent visual patterns

### Content Constraints
- **3 input types max:** Prevents overwhelming choice
- **Fixed 60-second timer:** No level progression to avoid scope creep
- **Single plant factory:** One-screen design eliminates navigation complexity
- **Educational messaging:** Maximum 2 sentences per feedback popup

## Accessibility Implementation Details

### Keyboard Navigation System
```
Arrow Keys: Navigate between available input items
WASD: Move selected item around factory area
Spacebar: Drop item at current position
Tab: Cycle through UI elements (start button, accessibility options)
Enter: Activate buttons and selections
```

### Visual Accessibility
- **Color-blind safe palette:** Uses distinct shapes (circle, triangle, hexagon) not just colors
- **Shape coding system:** 
  - Sun = Circle + triangular points
  - Water = Teardrop (arc-based shape)
  - CO₂ = Circle + text label
  - Oxygen = Oval + "O₂" label
  - Glucose = Hexagon + "C₆H₁₂O₆" label

### Motor Accessibility
- **Click-to-place mode:** Alternative to dragging - click input, then click destination
- **Larger touch targets:** Minimum 44px interactive areas
- **Adjustable timing:** Option to extend 60-second timer to 90 seconds

This design maintains the core educational effectiveness while ensuring all students can participate regardless of their accessibility needs. The game teaches photosynthesis through direct interaction while providing multiple ways to engage with the content.