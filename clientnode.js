var wsAva = ("WebSocket" in window);
var port = "25563", host = "2.124.79.196", socket = null, jsClose = false, connected=false;

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
                    break;
                case "PLAYER-JOIN":
                    console.log(packet);
                    new Message(null,"<b>"+packet.player+"</b> joined the game!","yellow").pushToChat();
                    break;
                case "PLAYER-DISCONNECT":
                    new Message(null,packet.player+" left the game!","yellow").pushToChat();
                    break;
                case "RAW-MESSAGE":
                    new Message(packet.sender,packet.message,"white").pushToChat();
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
    if(document.getElementById("chattext").value == "/recon"){
        jsClose = true;
        socket.close();
        document.getElementById("chattext").value = "";
    }else{
        msgPacket = new Packet("MESSAGE");
        msgPacket.message = document.getElementById("chattext").value;
        document.getElementById("chattext").value = "";
        socket.send(JSON.stringify(msgPacket)); 
    }
}

function error(msg){
    alert("Encountered Error: "+msg+".");
}
function Packet(type){
    this.packetType = type;
}