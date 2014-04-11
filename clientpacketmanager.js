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
    this.send = function(){
        try{
            socket.send(this.getPacket());
        }catch(err){
        }
    }
}