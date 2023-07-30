export class TokenFlipConfig extends FormApplication{
      constructor(...args) {
    super(...args);

  }

  static get defaultOptions() {
    return {
      ...super.defaultOptions,
      title: game.i18n.localize("tokenflip.config.formapp.title"),
      id: `tokenflip`,
      template: `modules/tokenflip/templates/tokenflip.hbs`,
      resizable: true,
      width: 400,
      dragDrop: [{ dragSelector: null, dropSelector: null }],
    };
  }

  getData() {

    let faces = this.object.getFlag("tokenflip", "tokenfaces") ?? [];
    if (!faces.length) {
      faces = [
        {
          actorId: this.object.actor.id,
          img: this.object.texture.src,
          id: randomID(20),
          scaleX: this.object.texture.scaleX,
          scaleY: this.object.texture.scaleY,
          width: this.object.width,
          height: this.object.height,
          model3d: this.object.flags["levels-3d-preview"]?.model3d ?? "",
        },
      ];
      this.object.setFlag("tokenflip", "tokenfaces", faces);
    } else {
      faces.forEach((f) => {
        if (f.model3d === undefined) f.model3d = this.object.flags["levels-3d-preview"]?.model3d ?? "";
        if (!f.width) f.width = this.object.width;
        if (!f.height) f.height = this.object.height;
      });
    }

    return {
      actorsarray: game.actors.contents.map(a => ({ name: a.name, id: a.id })),
      tokenfaces: faces,
    };
  }

  async activateListeners(html) {
    super.activateListeners(html);
    this.element[0].querySelector("button#add").addEventListener("click", this._onAdd.bind(this));
    this.element.on("change", "input", this.saveData.bind(this));
    this.element.on("click", "button.delete", this._onDelete.bind(this));
    this.setPosition({height: "auto"});
  }

  async _onDelete(e){
    $(e.currentTarget).closest("li").remove();
    await this.saveData();
    this.setPosition({height: "auto"});
  }

  async _onAdd(e){
    e.preventDefault();
    const data = this.object.getFlag("tokenflip", "tokenfaces") ?? [];
    const id = randomID(20);
    data.push({
      actorId: this.object.actor.id,
      img: this.object.texture.img,
      id: id,
      scaleX: this.object.texture.scaleX,
      scaleY: this.object.texture.scaleY,
      width: this.object.width,
      height: this.object.height,
      model3d: this.object.flags["levels-3d-preview"]?.model3d ?? "",
    });
    await this.object.setFlag("tokenflip", "tokenfaces", data);
    this.render(true);
    //this.setPosition({height: "auto"});
  }

  close() {
    this.saveData();
    super.close();
  }

  async saveData() {
    const ul = this.element[0].querySelector("ul");
    //loop ul
    let data = [];
    for (const li of ul.children) {
      const actorId = li.querySelector(`select`).value;
      const img = li.querySelector(`input[class="image"]`).value;
      const id = li.id;
      const scaleX = parseFloat(li.querySelector(`input[name="scaleX"]`).value);
      const scaleY = parseFloat(li.querySelector(`input[name="scaleY"]`).value);
      const width = parseFloat(li.querySelector(`input[name="width"]`).value);
      const height = parseFloat(li.querySelector(`input[name="height"]`).value);
      const model3d = li.querySelector(`input[name="model3d"]`).value;
      data.push({ actorId, img, id, scaleX, scaleY, width, height, model3d });
    }
    await this.object.setFlag("tokenflip", "tokenfaces", data);
  }
}