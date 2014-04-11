var msgcount = 0;

$(document).ready(function(){
    $("#chatOptions button").each(function(){
       $(this).click(function(){
           if($(this).attr("toggled") == "true"){
               $(this).attr("toggled","false");
           }else{
               $(this).attr("toggled","true");
           }
           updateChatView();
       });
    });
});

function Message(sender,message,colour){
    message = message.replace(new RegExp(":P","g"), '<img src="chat/icons/tongue-out.png" />');
    message = message.replace(new RegExp(":D","g"), '<img src="chat/icons/very-happy-face.png" />');
    message = message.replace(new RegExp(":3","g"), '<img src="chat/icons/cute-face.png" />');
    message = message.replace(new RegExp(">:\\)","g"), '>: )');
    message = message.replace(new RegExp(">:\\(","g"), '>: (');
    message = message.replace(new RegExp(":3","g"), '<img src="chat/icons/cute-face.png" />');
    message = message.replace(new RegExp(":\\)","g"), '<img src="chat/icons/happy-face.png" />');
    message = message.replace(new RegExp(":\\(","g"), '<img src="chat/icons/sad-face.png" />');
    
    if(sender == "SERVER"){colour = "cyan";sender="SERVER"};
    this.sender = sender;
    this.message = message;
    this.colour = colour;
    this.id = 'chatmessage-'+msgcount;
    if(sender === null){
        this.msg="<div data-sender='"+sender+"' class='message' id='chatmessage-"+msgcount+"'><span style='color:"+colour+"'>"+message+"</span></div>";
    }else{
        this.msg="<div data-sender='"+sender+"' class='message' id='chatmessage-"+msgcount+"'>["+sender+"] <span style='color:"+colour+"'>"+message+"</span></div>";
    }
    msgcount++;
    return this;
}

Message.prototype.pushToChat = function(){
    $("#chat").append(this.msg);
    $("#"+this.id).hide();
    $("#"+this.id).fadeIn(100);
    updateChatViewSingular($("#"+this.id));
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

function updateChatView(){
    var showServer, showPlayers;
    showServer = ($("#chatOptionServer").attr("toggled") == "true");
    showClient = ($("#chatOptionClient").attr("toggled") == "true");
    showPlayers = ($("#chatOptionPlayers").attr("toggled") == "true");
    $("#chatArea #chat .message").each(function(){
        $(this).show();
        var flags = ["SERVER","CLIENT"];
        if((!showPlayers) && flags.indexOf($(this).attr("data-sender")) == -1){
            $(this).hide();
        }
        if((!showServer) && $(this).attr("data-sender") == "SERVER"){
            $(this).hide();
        }
        if((!showClient) && $(this).attr("data-sender") == "CLIENT"){
            $(this).hide();
        }
    });
}

function updateChatViewSingular(obj){
    var showServer, showPlayers;
    showServer = ($("#chatOptionServer").attr("toggled") == "true");
    showClient = ($("#chatOptionClient").attr("toggled") == "true");
    showPlayers = ($("#chatOptionPlayers").attr("toggled") == "true");
    $(obj).show();
    var flags = ["SERVER","CLIENT"];
        if((!showPlayers) && flags.indexOf($(obj).attr("data-sender")) == -1){
            $(obj).hide();
        }
    if((!showServer) && $(obj).attr("data-sender") == "SERVER"){
        $(obj).hide();
    }
    if((!showClient) && $(obj).attr("data-sender") == "CLIENT"){
        $(obj).hide();
    }
}