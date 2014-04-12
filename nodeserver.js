var port = 25563, clients = [], serverName = "Alpha Server";
var WebSocketServer = require('ws').Server , wss = new WebSocketServer({port: port});
var terrain = new Array();
var commands = require('./nodeservercommand.js');
/*
    Command Usage Guide
    {}      Optional Paramater
    []      Required paramater
*/



commands.add(new commands.Command("help","/help {command}","Provides information and help on commands",1,2,function(socket,params){
    if(params.length == 1){
        var cmds = [];
        for(i in commands.Registry){
            cmds.push("/"+commands.Registry[i].name);
        }
        new Packet("RAW-MESSAGE").attr("sender","SERVER").attr("message","Available commands:<br />"+cmds.join(", ")).broadcast([socket]);
    }else{
        for(i in commands.Registry){
            if(commands.Registry[i].name == params[1]){
                command = commands.Registry[i];
                new Packet("RAW-MESSAGE").attr("sender","SERVER").attr("message","/"+command.name+"<br />Usage: "+command.usage+"<br />"+command.helpDef).broadcast([socket]);
                return;
            }
        }
        new Packet("RAW-MESSAGE").attr("sender","SERVER").attr("message","Unknown command").broadcast([socket]);
    }
}));

commands.add(new commands.Command("list", "/list", "Lists online players",1,1,function(socket,params){
    nms = []; for(i in clients){nms.push(clients[i].displayName)};
    new Packet("RAW-MESSAGE").attr("sender","SERVER").attr("message", nms.join(", ")).broadcast([socket]);
}));

var version = "0.1.7.1"; //want to stay at 0.1.7 for foreseeable future.

log("Running AdventureLands version "+version);
log("Running on port "+port);

wss.on('connection', function(ws) {
    if(ws._socket.remoteAddress == undefined) return;
    ws.displayName = "Guest"+(~~(Math.random() * 99999) + 1);
    ws.canSpeak = true;
    ws.pos = new Object();
    ws.pos.x = 50;
    ws.pos.y = 50;
    ws.pos.moving = false;
    clients.push(ws);
    for(i in clients){
        new Packet("PLAYER-UPDATE").attr("subtype","static-position").attr("player",clients[i].displayName).attr("x",clients[i].pos.x).attr("y",clients[i].pos.y).broadcast([ws]);
    }
    new Packet("PLAYER-UPDATE").attr("subtype","static-position").attr("player",ws.displayName).attr("x",ws.pos.x).attr("y",ws.pos.y).broadcast(clients);
    new Packet("INITIAL").attr("serverName",serverName).attr("clientName",ws.displayName).attr("clients",clients.length).broadcast([ws]);
    new Packet("PLAYER-JOIN").attr("player",ws.displayName).broadcast(clients);
    log(identity(ws)+" has joined. "+clients.length+" clients online.");
    ws.on('message', function(msg) {
        try{
            packet = JSON.parse(msg);
            switch(packet.packetType){
                case "MESSAGE":
                    if(packet.message.substring(0,1) !== "/"){
                        messagePacket = new Packet("RAW-MESSAGE");
                        /*Invalid Check*/
                        if(packet.message.length < 1) return;
                        if(packet.message.length > 128){
                            messagePacket.attr("sender","SERVER").attr("message","Messages need to be less than 128 characters long!").broadcast([ws]);
                            return;
                        }
                        if(!ws.canSpeak) return;
                        /*Invalid Check*/
                        messagePacket.attr("message",packet.message.clean()).attr("sender",ws.displayName.clean()).broadcast(clients);
                        log("["+ws.displayName+"] "+messagePacket._packet.message);
                        ws.canSpeak = false;
                        eval("setTimeout(function(){clients["+clients.indexOf(this)+"].canSpeak=true},1000)");
                    }else{
                        log(ws.displayName+" issued command '"+packet.message+"'")
                        params = packet.message.split(" ");
                        for(i in commands.Registry){
                            command = commands.Registry[i];
                            if("/"+command.name == params[0]){
                               if(params.length >= command.minArg && params.length <= command.maxArg){
                                   command.oncall(ws,params);
                                   return;
                               }else{
                                   new Packet("RAW-MESSAGE").attr("sender","SERVER").attr("message",command.usage).broadcast([ws]);
                                   return;
                               }
                            }
                        }
                        new Packet("RAW-MESSAGE").attr("sender","SERVER").attr("message","Unknown Command!").broadcast([ws]);
                    }
                    break;
                case "REQUEST-MOVE":
                    if(ws.pos.moving){
                        new Packet("REQUEST-MOVE-ANSWER").attr("accepted",false).attr("x",ws.pos.x).attr("y",ws.pos.y).broadcast([ws]);
                    }else{
                        /*distance = Math.sqrt(((players[i].pos.x-packet.x)*(players[i].pixi.position.x-packet.x)) + ((players[i].pixi.position.y-packet.y)*(players[i].pixi.position.y-packet.y)));
                        ws.pos.x = packet.x; ws.pos.y = packet.y;
                        new Packet("REQUEST-MOVE-ANSWER").attr("accepted",true).attr("x",packet.x).attr("y",packet.y).broadcast([ws]);
                        new Packet("PLAYER-UPDATE").attr("subtype","tween-position").attr("player",ws.displayName).attr("x",packet.x).attr("y",packet.y).broadcast(clients);
                        ws.pos.moving = true;
                        eval("setTimeout(function(){try{clients["+clients.indexOf(ws)+"].pos.moving=false}catch(e){}},"+0.5+")");*/
                        dir = packet.direction;
                        switch(dir){
                            case 2:
                                
                                break;
                        }
                    }
                    break;
                case "REQUEST-CHUNK":
                    chunkX = Math.floor(ws.pos.x/320);
                    chunkY = Math.floor(ws.pos.y/320);
                    chunk = [];
                    for(x=0;x<10;x++){
                        
                    }
                    break;
                default:
                    break;
            }
        }catch(emsg){
            console.log(emsg);
        }
    });
    
    ws.on('close', function(){
        clients.splice(clients.indexOf(this),1);
        log(identity(this)+" has left. "+(clients.length)+" clients online.");
        leavePacket = new Packet("PLAYER-DISCONNECT").attr("player",ws.displayName).broadcast(clients);
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
        this._packet[att] = val;
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
