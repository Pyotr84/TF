import { TokenFlipConfig } from "./formapp.js";
import { FlipMenu } from "./flipMenu.js";
import { flip } from "./module.js";

Hooks.once("init", () => {
  game.settings.register("tokenflip", "flipspeed", {
    name: game.i18n.localize("tokenflip.settings.flipspeed.name"),
    hint: game.i18n.localize("tokenflip.settings.flipspeed.hint"),
    scope: "world",
    config: true,
    type: Number,
    default: 0.1,
  });
});

Hooks.once("ready", async function () {});

export function injectConfiguration() {
  Hooks.on("renderTokenConfig", (app, html, data) => {
    const configureTokenFlipBtn = $(
      `<button class="configure-tokenflip-btn"><i class="fas fa-redo-alt"></i> ${game.i18n.localize(
        "tokenflip.config.formapp.title"
      )}</button>`
    );
    html
      .find(`input[name="actorLink"]`)
      .closest(".form-group")
      .after(configureTokenFlipBtn);
    configureTokenFlipBtn.click((e) => {
      e.preventDefault();
      const config = new TokenFlipConfig(app.token);
      config.render(true);
    });
    app.setPosition({ height: "auto" });
  });

  Hooks.on("renderTokenHUD", (app, html, data) => {
    const faces = app.object.document.getFlag("tokenflip", "tokenfaces") ?? [];
    if (!faces.length || faces.length < 2) return;
    const colRight = html.find(".col.right");
    const tokenFlipBtn = $(`
        <div class="control-icon " data-action="tokenflip">
            <img src="icons/svg/daze.svg" width="36" height="36" title="${game.i18n.localize(
              "tokenflip.config.formapp.flip"
            )}">
        </div>
        `);
    let useMenu = false;
    let flipped = false;
    tokenFlipBtn.on("mousedown", (e) => {
      e.preventDefault();
      flipped = false;
      setTimeout(() => {
        if (!flipped) {
          useMenu = true;
          console.log("open menu");
          const menu = new FlipMenu(app.object, html);
          menu.render(true);
          flipped = false;
        } else {
          useMenu = false;
        }
      }, 200);
    });
    tokenFlipBtn.on("mouseup", (e) => {
      if (useMenu) return (useMenu = false);
      flipped = true;
      flip(app.object);
      console.log("flip");
    });

    colRight.append(tokenFlipBtn);
  });
}
