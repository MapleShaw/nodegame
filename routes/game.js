/*
	deal with the logic of game
	处理游戏过程的逻辑
*/
module.exports = function(socket,rooms){
	/*
		prepare for game
		准备
	*/
	socket.on('prepareForGame',function(data){
		//data 格式 {_roomName : name,_userName : name}
		var user = rooms.getUser(data._roomName,data._userName);
		var room = rooms.getRoom(data._roomName);
		if(typeof user.errType == "undefined"){
			//所有玩家已经准备
			if(room.userPrepare()){
				if(room.isAllPrepare()){
					//游戏开始
					rooms[data._roomName].onGameStart();
					//广播
					io.sockets.in(data._roomName).emit('gameStart',{});
				}
			}
			else{
				socket.emit('err',{
					msg : 'system error'
				});
			}
		}
		else{
			//用户并未加入房间
			socket.emit('err',{
				msg : '用户并未加入房间'
			});
		}		
	});

	/*
		make a statement
		发言
	*/
	socket.on('onMakeStatement',function(data){
		//data 格式 {_userName : name, _roomName : name,}
		var roomName = data._roomName,
			userName = data._userName;
		//检验
		var user_temp = rooms.getUser(roomName,userName);
		var room_temp = rooms.getRoom(roomName);
		if(user_temp.errType != 'undefined'){
			socket.emit('err',{
				msg : user_temp.err
			});
			return -1;
		}
		//玩家已发言
		user_temp.makeStatement();
		if (room_temp.isStatementOver()) {
			//复位发言记录
			room_temp.onStatementOver();
			if(room_temp._turns != 0){
				//回合结束，开始投票
				io.sockets.in(roomName).emit('startVote',{});
				return 1;	
			}
			else{
				var nextName = room_temp.getNextPlayer();
				//下一个玩家发言
				io.sockets.in(roomName).emit('makeStatement',{
					_userName : nextName
				});
				return 1;
			}
		}
		else {
			//回合尚未结束,下一个玩家
			var nextName = room_temp.getNextPlayer();
			if(nextName){
				//拿到下一个玩家的名字
				io.sockets.in(roomName).emit('makeStatement',{
					_userName : nextName
				});
				return 1;
			}
			else{
				//错误
				io.sockets.in(roomName).emit('err',{
					msg : 'system error'
				});
				return -1;	
			}
		}
	});

	/*
		vote
		投票
	*/
	socket.on('voteOne',function(data){
		//data 格式 {_voteFrom : _userName,_voteToName : name,_roomName : name},放弃投票可将_voteToName置为null
		var roomName = data._roomName;
		var userName = data._userName;
		var voteToName = data._voteToName;

		var user_temp = rooms.getUser(roomName,userName);
		var room_temp = rooms.getRoom(roomName);
		if(typeof user_temp.errType != 'undefined'){
			//房间不存在
			socket.emit('err',{
				msg : user_temp.err,
			});
			return -1;
		}
		if(user_temp.isVote){
			//已经投过票
			socket.emit('err',{
				msg : '已经投过票不能重复投票'
			});
			return -2;
		}

		if(voteToName){
			var beVote_temp = rooms.getUser(roomName,voteToName);
			if(typeof beVote_temp.errType != 'undefined'){
				//所投的用户并未在该房间内
				socket.emit('err',{
					msg : beVote_temp.errType
				});
				return -3;
			}
			beVote_temp.beVoted();
		}
		user_temp.voteTo();

		//广播
		io.sockets.in(roomName).emit('Message',{
			msg : '玩家【'+userName+'】投给了玩家【'+voteToName+'】',
		});

		//所有玩家投过票
		if(room_temp.isAllVote()){
			//onVoteEnd返回的数据如下{max_vote_name:max_vote_name,max_vote:max_vote,max_repeat:max_repeat}
			var vote_data = room_temp.onVoteEnd();
			if(vote_data.max_repeat == 1 && vote_data.max_vote_name.length != 0){
				//只有一个玩家最高票
				io.sockets.in(roomName).emit('voteOut',{
					_userName :　vote_data.max_vote_name[0],
				});
				//清楚pk状态
				if(room_temp._isPK){
					room_temp.endPKTurn();
				}
				//是否满足游戏结束条件
				var gameover_temp = room_temp.isGameOver();
				if(gameover_temp){
					io.sockets.in(roomName).emit('gameOver',{
						msg : gameover_temp[1]
					});
				}
			}
			else if(vote_data.max_repeat > 1){
				//有多人最高票数，进入Pk环节
				io.sockets.in(roomName).emit('pkTurn',{
					_userName : vote_data.max_vote_name
				});
				//进入pk状态
				room_temp.onPKTurn(vote_data.max_vote_name);
			}
			else{
				return -1;
			}
		}
	});
}