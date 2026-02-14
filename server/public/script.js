function setInput(text) {
    document.getElementById('struggleInput').value = text;
}

document.getElementById('generateBtn').addEventListener('click', async () => {
    const input = document.getElementById('struggleInput').value;
    if (!input) return;

    // UI Updates
    document.querySelector('.input-section').classList.add('hidden');
    document.querySelector('.hero').classList.add('hidden');
    document.getElementById('status-panel').classList.remove('hidden');

    const termContent = document.getElementById('terminal-content');
    function log(agent, msg) {
        const line = document.createElement('div');
        line.className = 'log-line';
        line.innerHTML = `<span style="color:var(--secondary)">[${agent}]</span> ${msg}`;
        termContent.appendChild(line);
        termContent.scrollTop = termContent.scrollHeight;
    }

    // Start Timer
    let seconds = 0;
    const timerInterval = setInterval(() => {
        seconds++;
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        document.querySelector('.timer').innerText = `${mins}:${secs}`;
    }, 1000);

    // Simulate Agent Progress (Visual only, while backend "works")
    const agents = ['socrates', 'miyamoto', 'picasso', 'carmack', 'kojima', 'iwata', 'skinner', 'director'];
    const steps = [
        { agent: "SOCRATES", msg: "Analyzing semantic meaning of input...", time: 1000 },
        { agent: "SOCRATES", msg: "Identified key learning gaps: Chloroplast function, Energy conversion", time: 3000 },
        { agent: "MIYAMOTO", msg: "Drafting game design document (GDD)...", time: 5000 },
        { agent: "MIYAMOTO", msg: "Selected core mechanic: Resource Management / Puzzle", time: 7000 },
        { agent: "PICASSO", msg: "Generating pixel art assets for 'Chloroplast Factory'...", time: 9000 },
        { agent: "PICASSO", msg: "Assets generated: pipes, sun_icon, water_molecule", time: 12000 },
        { agent: "CARMACK", msg: "Writing C# Scripts: GameManager.cs, PipeController.cs...", time: 15000 },
        { agent: "KOJIMA", msg: "Designing Level 1: Intro to Light", time: 18000 },
        { agent: "DIRECTOR", msg: "Compiling Unity Project...", time: 22000 }
    ];

    let stepIndex = 0;
    const progressInterval = setInterval(() => {
        if (stepIndex < steps.length) {
            log(steps[stepIndex].agent, steps[stepIndex].msg);
            // Highlight active agent card
            document.querySelectorAll('.agent-card').forEach(c => c.style.borderColor = 'var(--border)');
            const agentId = `agent-${steps[stepIndex].agent.toLowerCase()}`;
            const card = document.getElementById(agentId);
            if (card) {
                card.style.borderColor = 'var(--accent)';
                card.style.transform = 'scale(1.05)';
                setTimeout(() => card.style.transform = 'scale(1)', 500);
            }
            stepIndex++;
        }
    }, 2500);

    try {
        // Actual Call to Backend
        const response = await fetch('/api/generate-game', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentInput: input,
                studentProfile: { grade: 10, history: "Visual Learner" }
            })
        });

        const data = await response.json();

        // Wait at least a few seconds to let the demo play out if backend is too fast
        setTimeout(() => {
            clearInterval(timerInterval);
            clearInterval(progressInterval);
            document.getElementById('status-panel').classList.add('hidden');
            document.getElementById('result-panel').classList.remove('hidden');

            // Populate result
            document.querySelector('.placeholder-game h3').innerText = data.gameId?.title || "Game Ready!";
            document.querySelector('.placeholder-game p').innerText = data.gameId?.description || "Your custom game is ready to play.";
        }, 22000); // Enforce a dramatic wait

    } catch (error) {
        console.error("Error:", error);
        log("ERROR", "Connection failed.");
        clearInterval(timerInterval);
    }
});
