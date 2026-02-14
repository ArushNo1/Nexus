"""HTML validation for the generated Kaplay game output."""

import re
from langchain.tools import tool


@tool
def validate_html(html_code: str) -> str:
    """Run basic validation checks on the generated HTML game code."""
    issues = []

    if "<!DOCTYPE html>" not in html_code:
        issues.append("Missing <!DOCTYPE html> declaration")
    if "<html" not in html_code:
        issues.append("Missing <html> tag")
    if "kaplay" not in html_code.lower():
        issues.append("Missing Kaplay CDN script reference")
    if "kaplay(" not in html_code:
        issues.append("Missing kaplay() initialization")

    # Check for balanced script tags
    open_scripts = len(re.findall(r"<script", html_code))
    close_scripts = len(re.findall(r"</script>", html_code))
    if open_scripts != close_scripts:
        issues.append(f"Unbalanced script tags: {open_scripts} open, {close_scripts} close")

    if not issues:
        return "VALID: All basic checks passed."
    return "ISSUES FOUND:\n" + "\n".join(f"- {i}" for i in issues)
