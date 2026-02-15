"""Headless browser test harness for playtesting generated games.

Writes the game HTML to a temp file, loads it in headless Chromium via
Playwright, and captures console errors / uncaught exceptions on startup.
"""

import tempfile
import os
from dataclasses import dataclass, field
from playwright.async_api import async_playwright

from utils.logger import get_logger

log = get_logger("puppeteer_runner")


@dataclass
class PlaytestResult:
    """Container for headless playtest output."""
    errors: list[str] = field(default_factory=list)
    console_warnings: list[str] = field(default_factory=list)
    console_logs: list[str] = field(default_factory=list)
    success: bool = True

    @property
    def summary(self) -> str:
        lines = []
        if self.errors:
            lines.append(f"ERRORS ({len(self.errors)}):")
            for e in self.errors:
                lines.append(f"  - {e}")
        if self.console_warnings:
            lines.append(f"WARNINGS ({len(self.console_warnings)}):")
            for w in self.console_warnings:
                lines.append(f"  - {w}")
        if not self.errors and not self.console_warnings:
            lines.append("No errors or warnings detected.")
        return "\n".join(lines)


async def run_game_headless(html_source: str, wait_ms: int = 5000) -> PlaytestResult:
    """Load game HTML in headless Chromium and capture startup errors.

    Args:
        html_source: The full HTML string of the game.
        wait_ms: How long to let the page run before collecting results.

    Returns:
        PlaytestResult with captured errors, warnings, and logs.
    """
    result = PlaytestResult()

    # Write HTML to a temp file
    tmp = tempfile.NamedTemporaryFile(
        suffix=".html", delete=False, mode="w", encoding="utf-8"
    )
    try:
        tmp.write(html_source)
        tmp.close()
        file_url = f"file://{os.path.abspath(tmp.name)}"

        log.info(f"Launching headless browser → {file_url}")

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()

            # Capture uncaught page errors (thrown exceptions, syntax errors)
            page.on("pageerror", lambda err: result.errors.append(str(err)))

            # Capture console messages
            def _on_console(msg):
                text = msg.text
                if msg.type == "error":
                    result.errors.append(text)
                elif msg.type == "warning":
                    result.console_warnings.append(text)
                else:
                    result.console_logs.append(text)

            page.on("console", _on_console)

            # Navigate and wait for the page to settle
            try:
                await page.goto(file_url, wait_until="load", timeout=15000)
            except Exception as e:
                result.errors.append(f"Page failed to load: {e}")
                result.success = False

            # Let the game run for a bit to catch async/runtime errors
            await page.wait_for_timeout(wait_ms)

            await browser.close()

        result.success = len(result.errors) == 0

    finally:
        os.unlink(tmp.name)

    error_count = len(result.errors)
    warn_count = len(result.console_warnings)
    log.info(f"Playtest complete → {error_count} errors, {warn_count} warnings")

    return result
