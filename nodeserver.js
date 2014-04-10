var port = 25563, clients = [], serverName = "Alpha Server";
var WebSocketServer = require('ws').Server , wss = new WebSocketServer({port: port});

var version = 0.1;

log("Running AdventureLands version "+version);
log("Running on port "+port);

fix = setInterval(function(){
    for(i in clients){
        clients[i].canSpeak = true;   
    }
}, 5000);

wss.on('connection', function(ws) {
    if(ws._socket.remoteAddress == undefined) return;
    ws.displayName = "Guest"+(~~(Math.random() * 99999) + 1);
    ws.canSpeak = true;
    clients.push(ws);
    
    new Packet("INITIAL").attr("serverName",serverName).attr("clientName",ws.displayName).attr("clients",clients.length).broadcast([ws]);
    
    new Packet("PLAYER-JOIN").attr("player",ws.displayName).broadcast(clients);
    log(identity(ws)+" has joined. "+clients.length+" clients online.");
    
    ws.on('message', function(msg) {
        try{
            packet = JSON.parse(msg);
            switch(packet.packetType){
                case "MESSAGE":
                    messagePacket = new Packet("RAW-MESSAGE");
                    if(packet.message.substring(0,1) !== "/"){
                        if(packet.message.length < 1) return;
                        if(packet.message.length > 128){
                            messagePacket.sender = "SERVER";
                            messagePacket.message = "Messages need to be less than 128 characters long!";
                            broadcastPacket(messagePacket,[ws]);
                            return;
                        }
                        if(!ws.canSpeak) return;
                        messagePacket.message = packet.message.clean();
                        messagePacket.sender = ws.displayName.clean();
                        log("["+ws.displayName+"] "+messagePacket.message);
                        broadcastPacket(messagePacket, clients);
                        ws.canSpeak = false;
                        sws = this;
                        setTimeout(function(){
                            sws.canSpeak=true;
                        },1000);
                    }else{
                        params = packet.message.split(" ");
                        messagePacket.sender = "SERVER";
                        log(identity(this)+" issued: '"+packet.message+"'");
                        switch(params[0]){
                            case "/name":
                                if(params.length !== 2){
                                    messagePacket.message = "Please check the command usage...";
                                    broadcastPacket(messagePacket, [ws]);
                                    return;
                                }else{
                                    for(i in clients){
                                        if(clients[i].displayName.toLowerCase() == params[1].toLowerCase()){
                                            messagePacket.message = "A player already has that name!";
                                            broadcastPacket(messagePacket, [ws]);
                                            return;
                                        }
                                    }
                                }
                                oldName = this.displayName;
                                log(identity(this)+" changed name to "+params[1]);
                                ws.displayName = params[1];
                                messagePacket.message = "Changed name!";
                                
                                changePacket = new Packet("RAW-MESSAGE");
                                changePacket.sender = "SERVER";
                                changePacket.message = oldName+" changed their name to "+params[1];
                                broadcastPacket(changePacket, clients);
                                
                                break;
                            default:
                                messagePacket.message = "Unknown command!";
                                break;
                        }
                        broadcastPacket(messagePacket, [ws]);
                    }
                    break;
                default:
                    break;
            }
        }catch(emsg){
            error(emsg);
        }
    });
    
    ws.on('close', function(){
        clients.splice(clients.indexOf(this),1);
        log(identity(this)+" has left. "+(clients.length)+" clients online.");
        leavePacket = new Packet("PLAYER-DISCONNECT");
        leavePacket.player = ws.displayName;
        broadcastPacket(leavePacket,clients);
    });
});

function broadcastPacket(packet,list){
    for(i in list){
        try{
            list[i].send(packet);
        }catch(err){
            //Terminate corrupted/closed socket
            list[i].terminate();
            list.splice(i,1);
        }
    }
}

function log(msg){
    time = new Date();
    console.log("<"+("0"+time.getHours()).slice(-2)+":"+("0"+time.getMinutes()).slice(-2)+":"+("0"+time.getSeconds()).slice(-2)+"> "+msg);
}

function Packet(type){
    this._packet = new Object();
    this._packet.packetType = type;
    this.attr = function(att, val){
        eval("this._packet."+att+"='"+val+"'");
        return this;
    };
    this.getPacket = function(){
        return JSON.stringify(this._packet);   
    };
    this.broadcast = function(list){
        for(i in list){
            try{
                list[i].send(this.getPacket());
            }catch(err){
                //Terminate corrupted/closed socket
                list[i].terminate();
                list.splice(i,1);
            }
        }
        return null;
    }
}

function identity(ws){
    return ws.displayName+" ("+ws._socket.remoteAddress+":"+ws._socket.remotePort+")";
}

String.prototype.clean=function(){
    return this.toString().split("<").join();
};