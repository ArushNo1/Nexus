# Nexus - Self-Adaptive Game Engine

**AI that generates personalized educational video games in Phaser (HTML5) based on what students are struggling with.**

Students learn better through play, but creating custom educational games takes months. Nexus uses 8 specialized AI agents to analyze a student's learning gaps and autonomously generate a complete, playable web game in minutes. Type "I don't understand photosynthesis" and get a custom puzzle game that teaches the concept through interactive gameplay.

##  Problem Statement
One-size-fits-all education fails students. Everyone learns differently, and traditional teaching methods don't adapt to individual needs. Creating personalized educational games is prohibitively expensive and time-consuming, making game-based learning inaccessible to most students.

##  Solution
Nexus is a multi-agent AI system that generates complete educational video games tailored to individual student needs:
1. **Student inputs their struggle** ("I don't understand fractions")
2. **8 AI agents collaborate** to design, code, and build a custom game
3. **Playable Phaser game generated** in 3-5 minutes
4. **Student plays and learns** through interactive gameplay
5. **System adapts** based on student performance in real-time

##  Tech Stack
- **Multi-agent coordination** with event-driven architecture
- **PatriotAI** for NLP, game design reasoning, and code generation
- **DALL-E/Stable Diffusion** for asset generation
- **Phaser.js** for game engine
- **Real-time performance tracking** and adaptation

##  The 8-Agent System
- **Socrates** - Analyzes learning gaps and student profile
- **Miyamoto** - Designs game mechanics that teach the concept
- **Picasso** - Generates visual assets (sprites, backgrounds, UI)
- **Carmack** - Writes Phaser.js code implementing game logic
- **Kojima** - Creates levels with progressive difficulty
- **Iwata** - Tests and balances gameplay
- **Skinner** - Implements adaptive learning analytics
- **Director** - Orchestrates agents and bundles final web build

<<<<<<< HEAD
##  Key Features
- Fully autonomous game generation (no human intervention)
- Playable .exe or WebGL builds in minutes
- Adaptive difficulty based on student performance
- Multi-genre support (puzzles, platformers, simulations, etc.)
- Works for any educational concept (math, science, history, languages)
- Real-time learning analytics
- Progressive level design that scaffolds learning
=======
## 🎯 Key Features
- ✅ Fully autonomous game generation (no human intervention)
- ✅ Playable in any web browser immediately
- ✅ Adaptive difficulty based on student performance
- ✅ Multi-genre support (puzzles, platformers, simulations, etc.)
- ✅ Works for any educational concept (math, science, history, languages)
- ✅ Real-time learning analytics
- ✅ Progressive level design that scaffolds learning
>>>>>>> 1dd5c11 (Switch engine from Unity to Phaser (HTML5))

##  demo Scenario
A student struggles with photosynthesis. They input this into Nexus. Within 3 minutes, they're playing "Photosynthesis Factory" - a puzzle game where they build chloroplast factories, connect water/CO2/light inputs, and produce glucose. The game teaches light reactions (Level 1), dark reactions (Level 2), and the full cycle (Level 3). After 15 minutes of play, analytics show 85% concept retention. The system suggests learning cellular respiration next (the reverse process).

## Why This Wins
- **Novel approach** - No one else is generating actual games with AI
- **Live demo** - Judges can watch a game being generated and play it in the browser
