module.exports = {
    generateCode: async (design, assets) => {
        console.log(`[CARMACK] Generating Phaser.js game code for ${design.title}...`);
        return { scripts: ["main.js", "GameScene.js", "Preloader.js"] };
    }
};
