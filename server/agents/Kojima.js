module.exports = {
    createLevels: async (design, code) => {
        console.log(`[KOJIMA] Building 3 levels for: ${design.title}`);
        return [
            { id: 1, name: "Intro to Light Reactions", difficulty: 0.2 },
            { id: 2, name: "Calvin Cycle Basics", difficulty: 0.5 },
            { id: 3, name: "Total Synthesis", difficulty: 0.9 }
        ];
    }
};
