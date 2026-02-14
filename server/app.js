const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');

// Middleware
app.use(bodyParser.json());
app.use(express.static('public')); // For serving generated games/assets

// Import Agents
const Director = require('./agents/Director');

// API Endpoint to start game generation
app.post('/api/generate-game', async (req, res) => {
    const { studentInput, studentProfile } = req.body;

    console.log(`Received request: "${studentInput}" for student: ${JSON.stringify(studentProfile)}`);

    try {
        // Initialize Director agent to orchestrate the process
        const gameId = await Director.orchestrateGameGeneration(studentInput, studentProfile);

        res.json({
            success: true,
            message: "Game generation started successfully.",
            gameId: gameId,
            status: "generating"
        });
    } catch (error) {
        console.error("Error generating game:", error);
        res.status(500).json({ success: false, message: "Failed to start game generation." });
    }
});

// Endpoint to check status of generation (polling)
app.get('/api/game-status/:gameId', (req, res) => {
    // detailed status logic to be implemented
    res.json({ status: "processing", progress: 20, currentAgent: "Socrates" });
});

app.listen(port, () => {
    console.log(`Nexus Game Engine running on http://localhost:${port}`);
});
