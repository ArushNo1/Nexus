"""Headless browser test harness for playtesting generated games."""

from langchain.tools import tool


@tool
async def run_game_in_browser(html_path: str) -> str:
    """Load the generated game in a headless browser and capture results.

    Returns console output, errors, and screenshots.
    """
    # TODO: Integrate Playwright for headless Chrome testing
    # from playwright.async_api import async_playwright
    #
    # async with async_playwright() as p:
    #     browser = await p.chromium.launch()
    #     page = await browser.new_page()
    #     errors = []
    #     page.on("pageerror", lambda err: errors.append(str(err)))
    #     await page.goto(f"file://{html_path}")
    #     await page.wait_for_timeout(5000)
    #     screenshot = await page.screenshot()
    #     await browser.close()
    #     return {"errors": errors, "screenshot": screenshot}
    return f"[Puppeteer not configured] Would test: {html_path}"
