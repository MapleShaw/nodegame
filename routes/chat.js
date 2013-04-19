/*
 * Serve content over a socket
 */
//用于记录所有的客户端
var users_chat = {};

module.exports = function (socket) {
    //客户端连接成功则设置客户端标示
	socket.on('setNickname', function (user) {
        
        users_chat[user.systemid] = socket;
        //set username
        users_chat[user.systemid].set('userID', user.systemid, function () { 
            users_chat[user.systemid].emit('ready', {}); 
        });
        //event of private message
        users_chat[user.systemid].on('chatPrivateMsg', function(data){
            var data = data;
            //get the username to judge if the user of "data.sendTo" is exist.
            try{
                users_chat[data.sendTo].get('userID', function(err, name){
                //send message to friend from server
                if (err) {
                    users_chat[user.systemid].emit('chatErrMsg', {
                        fromId : data.sendTo,
                        fromName : user.name,
                        toId : name,
                        msg : 'error msg : network problem.'
                    });
                    users_chat[user.systemid].emit('chatHaveReceive', {
                        fromId : data.sendTo,
                        flag : false
                    });
                } else {
                    users_chat[data.sendTo].emit('chatUserMsg', {
                        //id of who send the msg
                        fromId : user.systemid,
                        //name of who send the msg
                        fromName : user.name,
                        //id of who receive the msg
                        toId : name,
                        //text of msg
                        msg : data.sendText,
                    });
                    users_chat[user.systemid].emit('chatHaveReceive', {
                        fromId : data.sendTo,
                        flag : true
                    });
                }
            });
            }catch(e){
                users_chat[user.systemid].emit('chatErrMsg', {
                    fromId : data.sendTo,
                    fromName : 'system : ',
                    msg : 'error msg : the user is not online...',
                });
                users_chat[user.systemid].emit('chatHaveReceive', {
                    fromId : data.sendTo,
                    flag : false
                });
            }
        });
    });
    //loginOut
    socket.on('loginOut', function (data) {
        delete users_chat[data.userId];
    })
};
