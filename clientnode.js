var wsAva = ("WebSocket" in window);
var port = "25563", host = "2.124.79.196", socket = null, jsClose = false, connected=false;
var players = [];
var stage,renderer,playerName;
var smoothWorld = true;
var motds = ["Beware of bobbybeescratcher!","Such alpha!","Donate... when we get a PayPal setup...","Awesome-sauce!","GraviRift :3"];

$(document).ready(load);
$(document).ready(function(){
    $("#navBar").html(motds[Math.floor(Math.random()*motds.length)]);
});
function load(){
    connected=false;
    if("WebSocket" in window){
        socket = new WebSocket("ws://"+host+":"+port);
    }else if("MozWebSocket" in window){
        socket = new MozWebSocket("ws://"+host+":"+port);   
    }else{
        alert("You need a browser that supports websockets!");   
    }
    
    socket.onopen = function(){
        connected=true;
    }
    
    socket.onclose = function(){
        for(i in players){
           stage.removeChild(players[i].pixi);
        }
        players = [];
        if(jsClose){
            new Message(null,"<b>Closed connection, reconnecting in 5 seconds.</b>","#FF1919").pushToChat();
            jsClose=false;
        }else if(connected){
            new Message(null,"<b>Lost connection to server! Will attempt to reconnect in 5 seconds.</b>","#FF1919").pushToChat();
        }else{
            new Message(null,"<b>Cannot connect to server! Will attempt to reconnect in 5 seconds.</b>","#FF1919").pushToChat();
        }
        setTimeout(load,5000);
    }
    
    
    socket.onmessage = function(message){
        msg = message.data;
        try{
            packet = JSON.parse(msg);
            switch(packet.packetType){
                case "INITIAL":
                    playerName = packet.clientName;
                    new Message("CLIENT","Connected to "+packet.serverName,"yellow").pushToChat();
                    break;
                case "PLAYER-JOIN":
                    new Message("CLIENT","<b>"+packet.player+"</b> joined the game!","yellow").pushToChat();
                    break;
                case "PLAYER-DISCONNECT":
                    for(i in players){
                        if(players[i].name == packet.player){
                            stage.removeChild(players[i].pixi);
                            players.splice(i,1);
                        }
                    }
                    new Message("CLIENT","<b>"+packet.player+"</b> left the game!","yellow").pushToChat();
                    break;
                case "RAW-MESSAGE":
                    new Message(packet.sender,packet.message,"white").pushToChat();
                    break;
                case "PLAYER-UPDATE":
                    switch(packet.subtype){
                        case "static-position":
                            for(i in players){
                                if(players[i].name == packet.player){
                                    players[i].pixi.position.set(packet.x,packet.y);
                                    return;
                                }
                            }
                            players.push(new Player(packet.player,packet.x,packet.y));
                            break;
                        case "tween-position":
                            if(packet.player == playerName) break;
                            for(i in players){
                                if(players[i].name == packet.player){
                                    dist = Math.sqrt(((players[i].pixi.position.x-packet.x)*(players[i].pixi.position.x-packet.x)) + ((players[i].pixi.position.y-packet.y)*(players[i].pixi.position.y-packet.y)));
                                    TweenLite.to(players[i].pixi.position, dist/500, {x:packet.x,y:packet.y, ease:"Linear.easeNone"});
                                    return;
                                }
                            }
                            players.push(new Player(packet.player,packet.x,packet.y));
                            break;
                    }
                    break;
                case "REQUEST-MOVE-ANSWER":
                    if(!packet.accepted){
                        for(i in players){
                            if(players[i].name == playerName){
                                TweenLite.killTweensOf(players[i].pixi.position);
                                players[i].pixi.position.set(packet.x,packet.y);
                                return;
                            }
                        }
                    }
                    break;
                default:
                    error("Unexpected Packet Type '"+packet.packetType+"'; perhaps you are running a client which does not support the server?");
                    break;
            }
            
        }catch(emsg){
            error(emsg);
        }
    }
    
}

function sendMessage(){
    new Packet("MESSAGE").attr("message",document.getElementById("chattext").value).send();
    document.getElementById("chattext").value = "";
}

function error(msg){
    console.log("Encountered Error: "+msg+".");
}

function Player(name,x,y){
    this.name = name;
    this.pixi = new PIXI.DisplayObjectContainer();
    var sprite = new PIXI.Sprite(PIXI.Texture.fromImage("chat/icons/tongue-out.png"));
    sprite.anchor.x = 0.5; sprite.anchor.y = 0.5; sprite.position.set(0,0);
    this.pixi.addChild(sprite);
    
    var text = new PIXI.Text(name, {font:"16px 'Open Sans'", fill:"black"});
    text.position.y -= 24;
    text.anchor.x = 0.5;
    this.pixi.addChild(text);
    
    this.pixi.position.x = x;
    this.pixi.position.y = y;
}