var port = 25563, clients = [], serverName = "Alpha Server";
var WebSocketServer = require('ws').Server , wss = new WebSocketServer({port: port});
var commands = require('./nodeservercommand.js');
/*
    Command Usage Guide
    {}      Optional Paramater
    []      Required paramater
*/
commands.add(new commands.Command("help","/help {command}","Provides information and help on commands",1,2,function(socket,params){
    if(params.length == 1){
        new Packet("RAW-MESSAGE").attr("sender","SERVER").attr("message","Available commands:<br />/recon").broadcast([socket]);
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

var version = "0.1.4";

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
                        sws = this; setTimeout(function(){sws.canSpeak=true;},1000);
                    }else{
                        command = commands.Registry[i];
                        params = packet.message.split(" ");
                        for(i in commands.Registry){
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