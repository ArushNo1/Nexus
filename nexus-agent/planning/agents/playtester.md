1. STATIC ANALYSIS
   - Parse HTML for syntax errors
   - Check Phaser CDN link is valid
   - Verify all base64 assets are valid

2. RUNTIME TEST (via Puppeteer)
   - Load index.html in headless Chrome
   - Wait 5s, capture console errors → state.errors
   - Take screenshot of each scene (simulate click/key progression)
   - Check: Does the game render? Are there JS errors?

3. LLM EVALUATION (feed screenshots + error log to Claude)
   - Does the game match the GDD?
   - Are learning objectives visually present?
   - Is the documentation block present and accurate?
   - Is the game playable (based on screenshot progression)?

4. DECISION
   - No JS errors + LLM score >= 4/5 → SHIP
   - Else → FIX (with specific error log and critique)