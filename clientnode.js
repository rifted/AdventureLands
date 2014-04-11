var wsAva = ("WebSocket" in window);
var port = "25563", host = "2.124.79.196", socket = null, jsClose = false, connected=false;
var players = [];
var stage,renderer,playerName;

$(document).ready(load);
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
                                    players[i].pixi.position.x = packet.x;   
                                    players[i].pixi.position.y = packet.y;
                                    return;
                                }
                            }
                            players.push(new Player(packet.player,packet.x,packet.y));
                            break;
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
    this.pixi = new PIXI.Sprite(PIXI.Texture.fromImage("chat/icons/tongue-out.png"));
    this.pixi.anchor.x = 0.5;
    this.pixi.anchor.y = 0.5;
    this.pixi.position.x = x;
    this.pixi.position.y = y;
}