/*
 * Serve content over a socket
 */
//用于记录所有的客户端
var users_chat = {};

module.exports = function (socket) {
    //客户端连接成功则设置客户端标示
	socket.on('set nickname', function (id) {
        users_chat[id] = socket;
        //set username
        users_chat[id].set('username', id, function () { 
            users_chat[id].emit('ready', {}); 
        });
        //event of public message
        users_chat[id].on('chat_publicmsg', function(data){
            //console.log(JSON);return false;
            var data = eval(data);
            users_chat[id].get('username', function(err, name){
                    io.sockets.emit('chat_usermsg',{
                        from : name,
                        msg : data
                    });
            });
        });
        //event of private message
        users_chat[id].on('chat_privatemsg', function(data){
            //console.log(JSON);return false;
            var data = eval(data);
            //get the username to judge if the user of "data.sendTo" is exist.
            try{
                users_chat[data.sendTo].get('username', function(err, name){
                //send message to friend from server
                if (err) {
                    users_chat[id].emit('chat_errmsg', {
                        from : id,
                        to : name,
                        msg : 'error msg : network problem.',
                    });
                    users_chat[id].emit('chat_have_receive', {
                        flag : false
                    });
                } else {
                    users_chat[data.sendTo].emit('chat_usermsg', {
                        from : id,
                        to : name,
                        msg : data.sendText,
                    });
                    users_chat[id].emit('chat_have_receive', {
                        flag : true
                    });
                }
            });
            }catch(e){
                //console.log('the user is not exist.');
                users_chat[id].emit('chat_errmsg', {
                    from : 'system : ',
                    msg : 'error msg : the user is not exist.',
                });
                users_chat[id].emit('chat_have_receive', {
                    flag : false
                });
            }
            
        });
        for(var c in users_chat) {
            console.log(c);
        }
    });
};
