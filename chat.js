var msgcount = 0;

function Message(sender,message,colour){
    
    message = message.replace(new RegExp(":P","g"), '<img src="chat/icons/tongue-out.png" />');
    message = message.replace(new RegExp(":D","g"), '<img src="chat/icons/very-happy-face.png" />');
    message = message.replace(new RegExp(":3","g"), '<img src="chat/icons/cute-face.png" />');
    message = message.replace(new RegExp(">:\\)","g"), '>: )');
    message = message.replace(new RegExp(">:\\(","g"), '>: (');
    message = message.replace(new RegExp(":3","g"), '<img src="chat/icons/cute-face.png" />');
    message = message.replace(new RegExp(":\\)","g"), '<img src="chat/icons/happy-face.png" />');
    message = message.replace(new RegExp(":\\(","g"), '<img src="chat/icons/sad-face.png" />');
    
    this.sender = sender;
    this.message = message;
    this.colour = colour;
    this.id = 'chatmessage-'+msgcount;
    if(sender == "SERVER") this.colour = "cyan";
    if(sender === null){
        this.msg="<div class='message' id='chatmessage-"+msgcount+"'><span style='color:"+colour+"'>"+message+"</span></div>";
    }else{
        this.msg="<div class='message' id='chatmessage-"+msgcount+"'>["+sender+"] <span style='color:"+colour+"'>"+message+"</span></div>";
    }
    msgcount++;
    return this;
}

Message.prototype.pushToChat = function(){
    $("#chat").append(this.msg);
    $("#"+this.id).hide();
    $("#"+this.id).fadeIn(200);
    scrollChat();
}

function scrollChat(){
    area = document.getElementById('chatArea');
    area.scrollTop = area.scrollHeight;
}

$(document).ready(function(){
    $("#chattext").keyup(function(e){
        if(e.which == 13){
            sendMessage();
        }
    });
});