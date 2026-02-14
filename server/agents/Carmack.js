module.exports = {
    generateCode: async (design, assets) => {
        console.log(`[CARMACK] Generating C# scripts for ${design.title}...`);
        return { scripts: ["PlayerController.cs", "GameManager.cs", "ResourcePipe.cs"] };
    }
};
