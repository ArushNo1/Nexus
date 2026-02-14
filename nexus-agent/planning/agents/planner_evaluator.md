Node ① — Game Planner
Role: Translate the lesson plan into a concrete Game Design Document (GDD).
AspectDetailLLMClaude Sonnet 4 (creative + structured)Input from statelesson_plan, design_feedback (if revision loop)Output to stategame_design_doc, status → "evaluating"Prompt strategySystem prompt defines GDD template. User prompt injects the lesson plan JSON. If design_feedback exists, append it as revision instructions.
GDD Template the LLM should produce:
markdown## Game Design Document
### Core Concept
- Genre: (platformer / quiz / puzzle / simulation / etc.)
- Theme & narrative wrapper for the lesson
- Target play time: X minutes

### Learning Integration
- Which objectives map to which mechanics
- Knowledge checks / gates (must answer correctly to proceed)
- Scaffolding: how difficulty ramps with lesson progression

### Phaser Architecture
- Scenes: Boot → Preload → Menu → Level1..N → Results
- Key game objects and their behaviors
- Input handling (keyboard / touch)
- Score / progress tracking

### Assets Needed
- Sprite descriptions (character, enemies, items)
- Background descriptions per scene
- Sound FX list (jump, correct, wrong, victory)

### Scope Constraints
- Single HTML file target
- Phaser 3 CDN (no build step)
- Base64-embedded assets preferred
- < 2MB total file size

Node ② — Game Design Evaluator
Role: Quality-gate the GDD before any code is written.
AspectDetailLLMClaude Sonnet 4 (analytical)Input from stategame_design_doc, lesson_planOutput to statedesign_feedback, design_approved, design_iteration += 1Prompt strategyRubric-based evaluation. LLM scores 1-5 on each axis and makes a binary PASS/REVISE decision.
Evaluation Rubric (instruct LLM to score each):

Pedagogical alignment — Do mechanics actually teach the objectives?
Fun factor — Would a student want to play this?
Phaser feasibility — Can this realistically be built in a single HTML file with Phaser 3?
Scope control — Is it achievable without exceeding complexity budget?
Accessibility — Keyboard navigable? Color-blind safe? Clear instructions?

Decision logic:
if all scores >= 3 and average >= 3.5 → PASS
else → REVISE (with specific feedback per low-scoring axis)