## Game Design Document

{{ game_design_doc }}

{% if implementation_plan %}
## Implementation Plan

Follow this detailed task list and implementation roadmap when building the game:

{{ implementation_plan }}
{% endif %}

{% if is_revision %}
## Revision Context

This is a revision pass. The previous code had issues that need to be fixed.

### Previous Code
```html
{{ existing_code }}
```

### Playtest Report
{{ playtest_report }}

### Errors
{{ errors }}

Fix all reported errors and issues while preserving working functionality.
{% endif %}

---

{% if is_revision %}
Revise the Kaplay.js game code to fix the issues described above. Output the complete, corrected HTML file.
{% else %}
Generate a complete, self-contained Kaplay.js game as a single HTML file based on the GDD above. Output ONLY the HTML code.
{% endif %}
