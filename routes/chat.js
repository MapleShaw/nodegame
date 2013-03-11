/*
 * Serve content over a socket
 */
//用于记录所有的客户端
var users_chat = {};

module.exports = function (socket) {
    //客户端连接成功则设置客户端标示
	socket.on('set nickname', function (user) {
        var user = eval(user);
        users_chat[user.id] = socket;
        //set username
        users_chat[user.id].set('username', user.id, function () { 
            users_chat[user.id].emit('ready', {}); 
        });
        //event of public message
        users_chat[user.id].on('chat_publicmsg', function(data){
            var data = eval(data);
            users_chat[user.id].get('username', function(err, name){
                    io.sockets.emit('chat_usermsg',{
                        from : name,
                        msg : data
                    });
            });
        });
        //event of private message
        users_chat[user.id].on('chat_privatemsg', function(data){
            var data = eval(data);
            //get the username to judge if the user of "data.sendTo" is exist.
            try{
                users_chat[data.sendTo].get('username', function(err, name){
                //send message to friend from server
                if (err) {
                    users_chat[user.id].emit('chat_errmsg', {
                        fromId : data.sendTo,
                        fromName : user.username,
                        toId : name,
                        msg : 'error msg : network problem.'
                    });
                    users_chat[user.id].emit('chat_have_receive', {
                        fromId : data.sendTo,
                        flag : false
                    });
                } else {
                    users_chat[data.sendTo].emit('chat_usermsg', {
                        //id of who send the msg
                        fromId : user.id,
                        //name of who send the msg
                        fromName : user.username,
                        //id of who receive the msg
                        toId : name,
                        //text of msg
                        msg : data.sendText,
                    });
                    users_chat[user.id].emit('chat_have_receive', {
                        fromId : data.sendTo,
                        flag : true
                    });
                }
            });
            }catch(e){
                users_chat[user.id].emit('chat_errmsg', {
                    fromId : data.sendTo,
                    fromName : 'system : ',
                    msg : 'error msg : the user is not exist.',
                });
                users_chat[user.id].emit('chat_have_receive', {
                    flag : false
                });
            }
            
        });
    });
};
