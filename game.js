stage = new PIXI.Stage(0x0F0F0F, true);
chunksX = Math.floor(screen.availWidth/320);
chunksY = Math.floor(screen.availHeight/320);
// one chunk is 10x10 tiles, meaning 320x320 in terms of pixels.
renderer = PIXI.autoDetectRenderer(chunksX*320, chunksY*320);
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
    new Packet("REQUEST-MOVE").attr("direction",6).send();
    //Start moving already, as all clients - maybe apart from host - will experience lag here!
    for(i in players){
        if(players[i].name == playerName){
            dist = Math.abs(players[i].pixi.position.x-mouse.x)+Math.abs(players[i].pixi.position.y-mouse.y);
            TweenLite.to(players[i].pixi.position, dist/500, {x:mouse.x,y:mouse.y, ease:"Linear.easeNone"});
            return;
        }
    }
}