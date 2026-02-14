module.exports = {
    generateAssets: async (design) => {
        console.log(`[PICASSO] Creating visual assets for: ${design.visualStyle}`);
        return { sprites: ["pipe_corner.png", "chloroplast.png"], backgrounds: ["factory_bg.png"] };
    }
};
