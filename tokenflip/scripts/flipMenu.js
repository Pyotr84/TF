import { flip } from "./module.js";

export class FlipMenu extends Application{
    constructor(token,hud) {
    super();
    this.object = token;
    this.document = token.document
    this.hud = hud
    }

    static get defaultOptions() {
    return {
        ...super.defaultOptions,
        id: `tokenflipmenu`,
        template: `modules/tokenflip/templates/tokenflipmenu.hbs`,
        resizable: false,
        popout: true,
        width: 300,
        height: 700,
    };
    }

    getData() {
    return {
        tokenfaces: (this.document.getFlag("tokenflip", "tokenfaces") ?? []).map(t => ({
            actorId: t.actorId,
            actorName: game.actors.get(t.actorId)?.name,
            img: t.img,
            id: t.id
          })),
    };
    }

    async activateListeners(html) {
    super.activateListeners(html);
    this.element.on("click", "li", this._onClick.bind(this));
    this.setPosition({top:0,left:70, height: "auto"});
    const hudScale = parseFloat($("#hud")[0].style.transform.match(/scale\(([0-9.]+)\)/)[1]);
    const hud = this.hud;
    const offset = hud.find(`div[data-action="tokenflip"]`).offset();
    const btnWidth = (hud.find(`div[data-action="tokenflip"]`).width()+10)*hudScale;
    this.setPosition({top:offset.top-3,left:offset.left+btnWidth});
    this.element.css({
        transform: `scale(${hudScale})`,
        "transform-origin": "top left",
    });
    }

    async _onClick(e) {
        const id = $(e.currentTarget).data("id");
        flip(this.object,id);
    }

}