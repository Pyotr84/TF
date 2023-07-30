export function flip(token,id){

    const currentActor = token.actor.id
    const currentImg = token.document.texture.src
    const currentScaleX = token.document.texture.scaleX;
    const currentScaleY = token.document.texture.scaleY;
    const faces = token.document.getFlag("tokenflip", "tokenfaces") ?? [];
    if(!faces.length) return;
    const currentFace = faces.find(f => f.img === currentImg && f.actorId === currentActor && f.scaleX === currentScaleX && f.scaleY === currentScaleY);
    const currentIndex = faces.indexOf(currentFace) > -1 ? faces.indexOf(currentFace) : 0;

    const nextFace = id ? faces.find(f => f.id === id) : faces[(currentIndex + 1) % faces.length];
    if(!nextFace) return;

    token.flipUser = game.user.id;

    token.document.update({
        flags: {
            tokenflip: {
                previousImg: currentImg,
                previousScale: {
                    x: token.mesh.scale.x,
                    y: token.mesh.scale.y
                },
                nextFace: nextFace
            }
        }
    })

}

let flipSpeed = 0.1;

Hooks.on("updateToken", (token,updates) => {
    if(!updates.flags?.tokenflip?.nextFace) return;
    flipSpeed = game.settings.get("tokenflip", "flipspeed") || 0.1;
    animate(token.object);
})

async function animate(token){

    let scale

    while(!scale){
    try{
        scale = token.mesh.scale;
    }
    catch(e){}
    await wait(10);
    }

    const tex0 = await loadTexture(token.document.flags.tokenflip.previousImg, {fallback: CONST.DEFAULT_TOKEN});
    const tex1 = await loadTexture(token.document.flags.tokenflip.nextFace.img, {fallback: CONST.DEFAULT_TOKEN});

    const newScale = computeNewScale(token, tex1);

    const animation = {
        token: token,
        scaleFactor: 1,
        stage : 0,
        startImg : token.document.flags.tokenflip.previousImg,
        endImg : token.document.texture.src,
        scaleX0 : token.document.flags.tokenflip.previousScale.x,
        scaleY0 : token.document.flags.tokenflip.previousScale.y,
        scaleX1 : newScale.x,
        scaleY1 : newScale.y,
        tex0: tex0,
        tex1: tex1,
        nextFace: token.document.flags.tokenflip.nextFace
    }

    if(!canvas.tokens.flipping || !Object.values(canvas.tokens.flipping).length){
        canvas.tokens.flipping = {};
        canvas.app.ticker.add(_tickerAnimation);
    }

    token.flipping = true;
    canvas.tokens.flipping[token.id] = animation;
    

}

async function wait(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

function _tickerAnimation(delta){

    for(let [id,animation] of Object.entries(canvas.tokens.flipping)){
        if(!animation.token.mesh || animation.token.document.texture.src === animation.nextFace) continue;

        if(animation.stage === 0){
            animation.scaleFactor -= delta * flipSpeed;
            if(animation.scaleFactor <= 0) animation.scaleFactor = 0;
        }else{
            animation.scaleFactor += delta * flipSpeed;
            if(animation.scaleFactor >= 1) animation.scaleFactor = 1;
        }
        
        if(animation.scaleFactor === 0 && animation.stage === 0){
            animation.stage = 1;
        }


        if(animation.scaleFactor === 1 && animation.stage === 1){
            animation.token.flipping = false;
            if(animation.token.flipUser === game.user.id){
                animation.token.removeChild(animation.token.target);
                animation.token.target = animation.token.addChild(new PIXI.Graphics());
                const updateData = {
                    actorId: animation.nextFace.actorId,
                    texture: {
                        src: animation.nextFace.img,
                        scaleX: animation.nextFace.scaleX,
                        scaleY: animation.nextFace.scaleY
                    },
                    flags: {
                        "levels-3d-preview": {
                        }
                    }
                }
                if (animation.nextFace.width) updateData.width = animation.nextFace.width;
                if (animation.nextFace.height) updateData.height = animation.nextFace.height;
                if (animation.nextFace.model3d) updateData.flags["levels-3d-preview"].model3d = animation.nextFace.model3d;

                animation.token.document.update(updateData);
                delete canvas.tokens.flipping[id];
                continue;
            }   
            delete canvas.tokens.flipping[id];
        }

        //try{
            if(animation.token?.mesh?.scale) {
                const tex = animation.stage ? animation.tex1 : animation.tex0;
                animation.token.mesh.texture = tex;
                const scaleX = animation.stage ? animation.scaleX1 : animation.scaleX0;
                const scaleY = animation.stage ? animation.scaleY1 : animation.scaleY0;
                animation.token.mesh.scale.set(scaleX * animation.scaleFactor, scaleY);
                animation.token.mesh.anchor.set(0.5, 0.5);
            }
        //}catch(e){}
    }

    if(!Object.values(canvas.tokens.flipping).length){
        canvas.app.ticker.remove(_tickerAnimation);
    }
}

function computeNewScale(token, tex){
    const newScaleX = token.document.flags.tokenflip.nextFace.scaleX ?? token.mesh.scale.x;
    const newScaleY = token.document.flags.tokenflip.nextFace.scaleY ?? token.mesh.scale.y;
    const sprite = new PIXI.Sprite(tex);
    if (tex) {
      let aspect = tex.width / tex.height;
      const scale = sprite.scale;
      if (aspect >= 1) {
        sprite.width = token.w * newScaleX;
        scale.y = Number(scale.x);
      } else {
        sprite.height = token.h * newScaleY;
        scale.x = Number(scale.y);
      }
    }

    // Mirror horizontally or vertically
    //sprite.scale.x = Math.abs(sprite.scale.x) * (token.data.mirrorX ? -1 : 1);
    //sprite.scale.y = Math.abs(sprite.scale.y) * (token.data.mirrorY ? -1 : 1);
    const resScale = { x: sprite.scale.x, y: sprite.scale.y }
    sprite.destroy();
    return resScale;
}