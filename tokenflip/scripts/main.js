import { TokenFlipConfig } from "./formapp.js";
import { injectConfiguration } from "./config.js";
import { flip } from "./module.js";

CONFIG.Token.objectClass.prototype.flip = function (id) {
    flip(this, id);
}

injectConfiguration();

Hooks.once('ready', async function() {
    game.tfc = TokenFlipConfig;

    libWrapper.register("tokenflip", "BasePlaceableHUD.prototype.clear", (wrapped) => {
        wrapped();
        Object.values(ui.windows).forEach(w => {
            if(w.id === "tokenflipmenu") w.close();
        })
    }, "WRAPPER");
    
});