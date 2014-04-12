stage = new PIXI.Stage(0x66FF99, true);
renderer = PIXI.autoDetectRenderer(960, 640);
renderer.view.id = "gameCanv";
document.getElementById("gameArea").appendChild(renderer.view);
requestAnimFrame(animate);
stage.setInteractive(true);

function animate() {
    requestAnimFrame(animate);
    for(i in players){
        if(stage.children.indexOf(players[i].pixi) == -1) stage.addChild(players[i].pixi); //If the stage doesn't already have the player sprite, add it!
    }
    renderer.render(stage);
}

stage.click = function(data){
    mouse = stage.getMousePosition();
    new Packet("REQUEST-MOVE").attr("x",mouse.x).attr("y",mouse.y).send();
    //Start moving already, as all clients - maybe apart from host - will experience lag here!
    for(i in players){
        if(players[i].name == playerName){
            dist = Math.abs(players[i].pixi.position.x-mouse.x)+Math.abs(players[i].pixi.position.y-mouse.y);
            TweenLite.to(players[i].pixi.position, dist/500, {x:mouse.x,y:mouse.y, ease:"Linear.easeNone"});
            return;
        }
    }
}