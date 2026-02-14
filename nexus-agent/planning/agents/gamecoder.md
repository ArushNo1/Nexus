Role: Write the actual Phaser 3 game code and comprehensive inline documentation.
AspectDetailLLMClaude Opus (code generation strength)Input from stategame_design_doc, assets, playtest_report + errors (if fix loop)Output to statephaser_code, documentation, status → "generating_assets"ToolsPhaser 3 docs (RAG retrieval), ESLint check (tool call), HTML validatorPrompt strategySystem prompt contains Phaser 3 boilerplate patterns and best practices. Include the full GDD. If in a fix loop, include the error log and playtest report as revision context.
Code structure the LLM should produce (single index.html):
<!DOCTYPE html>
<html>
<head>
  <!-- Lesson metadata in <meta> tags -->
  <!-- Phaser 3 CDN -->
  <script src="https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.min.js"></script>
</head>
<body>
  <script>
    /**
     * ╔══════════════════════════════════════╗
     * ║  GAME DOCUMENTATION                  ║
     * ║  Generated from: [lesson plan title] ║
     * ║  Objectives: [...]                   ║
     * ║  How learning is integrated: [...]   ║
     * ╚══════════════════════════════════════╝
     */

    // ── CONFIG ──
    const config = { /* Phaser config */ };

    // ── SCENE: Boot ──
    class BootScene extends Phaser.Scene { /* ... */ }

    // ── SCENE: Game ──
    class GameScene extends Phaser.Scene {
      /** @doc This scene implements [objective X] through [mechanic Y] */
    }

    // ── SCENE: Results ──
    class ResultsScene extends Phaser.Scene { /* ... */ }

    // ── LAUNCH ──
    new Phaser.Game(config);
  </script>
</body>
</html>
Documentation requirements:

JSDoc headers on every class and major method
A top-level documentation block mapping lesson objectives → game mechanics
Inline comments explaining why, not what

