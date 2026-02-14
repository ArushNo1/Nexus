## Game Design Selection

{{ game_design_doc }}

## Base Template ({{ game_type }})

```html
{{ template_code }}
```

{% if implementation_plan %}
## Implementation Plan

Follow this technical plan for reskinning and addon implementation:

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
Revise the game code to fix the issues described above. Output the complete, corrected HTML file.
{% else %}
Modify the base template according to the implementation plan: reskin all visuals and implement the addon mechanic. Output the complete HTML file.
{% endif %}
