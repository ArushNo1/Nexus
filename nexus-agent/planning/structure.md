phaser-game-agent/
├── pyproject.toml                   # Project config (use Poetry or uv)
├── .env                             # API keys (ANTHROPIC_API_KEY, OPENAI_API_KEY)
├── .env.example
├── README.md
│
├── src/
│   ├── __init__.py
│   │
│   ├── state.py                     # AgentState TypedDict definition
│   ├── graph.py                     # LangGraph wiring (nodes + edges + compile)
│   ├── main.py                      # CLI entry point: load JSON → run graph → save HTML
│   │
│   ├── nodes/                       # One file per agent node
│   │   ├── __init__.py
│   │   ├── game_planner.py          # Node ① implementation
│   │   ├── design_evaluator.py      # Node ② implementation
│   │   ├── game_coder.py            # Node ③ implementation
│   │   ├── asset_generator.py       # Node ④ implementation
│   │   └── game_player.py           # Node ⑤ implementation
│   │
│   ├── prompts/                     # Prompt templates (keep separate from logic)
│   │   ├── planner_system.md
│   │   ├── planner_user.md          # Jinja2 template with {{lesson_plan}} slot
│   │   ├── evaluator_system.md
│   │   ├── evaluator_rubric.md
│   │   ├── coder_system.md
│   │   ├── coder_phaser_patterns.md # Phaser 3 best practices for RAG
│   │   ├── asset_system.md
│   │   └── player_system.md
│   │
│   ├── tools/                       # LangGraph tool definitions
│   │   ├── __init__.py
│   │   ├── phaser_docs_rag.py       # Vector store retrieval over Phaser 3 docs
│   │   ├── image_generator.py       # DALL·E / SD wrapper
│   │   ├── sound_generator.py       # jsfxr / Web Audio synth
│   │   ├── html_validator.py        # Validates the output HTML
│   │   ├── puppeteer_runner.py      # Headless browser test harness
│   │   └── base64_embedder.py       # Convert assets to data URIs
│   │
│   └── utils/
│       ├── __init__.py
│       ├── llm.py                   # LLM client factory (switch models per node)
│       ├── logger.py                # Structured logging for each node
│       └── config.py                # Pydantic settings (max iterations, model names, etc.)
│
├── data/
│   ├── phaser_docs/                 # Scraped Phaser 3 API docs for RAG
│   │   └── ...chunks.json
│   └── sample_lesson_plans/         # Example inputs for testing
│       ├── fractions_platformer.json
│       ├── photosynthesis_quiz.json
│       └── history_timeline.json
│
├── output/                          # Generated games land here
│   └── .gitkeep
│
└── tests/
    ├── test_state.py
    ├── test_graph_flow.py           # Integration test: mock LLMs, verify state transitions
    ├── test_nodes/
    │   ├── test_planner.py
    │   ├── test_evaluator.py
    │   ├── test_coder.py
    │   ├── test_asset_gen.py
    │   └── test_player.py
    └── fixtures/
        ├── sample_gdd.md
        ├── sample_phaser_code.html
        └── sample_lesson_plan.json