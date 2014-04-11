stage = new PIXI.Stage(0x66FF99);
renderer = PIXI.autoDetectRenderer(720, 480);
renderer.view.id = "gameCanv";
document.getElementById("gameArea").appendChild(renderer.view);

var texture = PIXI.Texture.fromImage("chat/icons/tongue-out.png");

var smile = new PIXI.Sprite(texture);

smile.anchor.x = 0.5;
smile.anchor.y = 0.5;

smile.position.x = renderer.view.width/2;
smile.position.y = renderer.view.height/2;

stage.addChild(smile);

requestAnimFrame(animate);

function animate() {
    requestAnimFrame(animate);
    for(i in players){
        if(stage.children.indexOf(players[i].pixi) == -1) stage.addChild(players[i].pixi); //If the stage doesn't already have the player sprite, add it!
    }
    renderer.render(stage);
}