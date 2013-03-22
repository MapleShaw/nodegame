/*
	deal with the logic of game
	处理游戏过程的逻辑
*/
module.exports = function(socket,rooms,io){
	/*
		Get User Info
		获取玩家信息
	*/
	socket.on('getUserInfo',function(data){
		//获取某个用户的信息
		var roomName = data._roomName;
		var userID = data._userID;
		var user_temp = rooms.getUser(roomName,userID);
		if(typeof user_temp.errType == "undefined"){
			socket.emit('setUserInfo',{
				_userInfo: user_temp.getUserInfo(),
			});
		}
		else{
			return;
		}
	});

	/*
		prepare for game
		准备
	*/
	socket.on('prepareForGame',function(data){
		//data 格式 {_roomName : name,_userName : name,_userID:userID}
		var roomName = data._roomName;
		var userName = data._userName;
		var userID = data._userID;
		var user = rooms.getUser(roomName,userID);
		var room = rooms.getRoom(roomName);
		if(typeof user.errType == "undefined"){
			//玩家准备
			if(room.userPrepare(userID)){
				io.sockets.in(roomName).emit('Message',{
					type: 2,
					msg : '玩家【'+userName+"】已准备",
				});
				//更新房间成员状态
				var list_temp = room.getRoomMemberList();
				io.sockets.in(roomName).emit('updateRoomMember',{
					_list: list_temp,
				});
				//所有玩家已经准备
				if(room.isAllPrepare()){
					//游戏开始
					room.onGameStart();
					//广播
					io.sockets.in(roomName).emit('gameStart',{});
					var nextName = room.getNextPlayer();
					if(nextName){
						//第一个个玩家
						io.sockets.in(roomName).emit('Message',{
							type: 3,
							msg: '玩家【'+nextName+'】开始发言'
						});
						io.sockets.in(roomName).emit('makeStatement',{
							_userName : nextName,
						});
					}
					else{
						//获取不到下个玩家
						io.sockets.in(roomName).emit('err',{
							msg: 'system err'
						});
					}
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
		get identity
		获得身份，谜底等
	*/
	socket.on('getIdentity',function(data){
		var roomName = data._roomName;
		var userName = data._userName;
		var userID = data._userID;
		var user = rooms.getUser(roomName,userID);
		if(user.errType){
			return false;
		}
		else{
			var data = {};
			data._word = user.word;
			if(user.wordLength){
				data._wordLength = user.wordLength;
			}
			socket.emit('setIdentity',data);
		}
	});

	/*
		make a statement
		发言
	*/
	socket.on('onMakeStatement',function(data){
		//data 格式 {_userName : name, _roomName : name,}
		var roomName = data._roomName,
			userName = data._userName,
			userID = data._userID,
			statement = data._statement;
		//检验
		var user_temp = rooms.getUser(roomName,userID);
		var room_temp = rooms.getRoom(roomName);
		if(user_temp.errType){
			socket.emit('err',{
				msg : user_temp.err
			});
			return false;
		}
		if(user_temp.isSay){
			//已发过言
			socket.emit('err',{
				msg: '你已发过言'
			});
			return false;
		}
		//玩家已发言
		user_temp.makeStatement();
		//广播
		io.sockets.in(roomName).emit('Message',{
			type: 4,
			msg : '玩家【'+userName+'】：'+statement,
		});
		if (room_temp.isStatementOver()) {
			//复位发言记录
			room_temp.onStatementOver();
			if(room_temp._turns != 1){
				//回合结束，开始投票
				io.sockets.in(roomName).emit('Message',{
					type: 5, 
					msg: '请开始投票'
				});
				io.sockets.in(roomName).emit('startVote',{});
				return 1;	
			}
			else{
				var nextName = room_temp.getNextPlayer();
				//下一个玩家发言
				io.sockets.in(roomName).emit('Message',{
					type: 6,
					msg: '轮到玩家【'+nextName+'】发言',
				});
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
				//下一个玩家发言
				io.sockets.in(roomName).emit('Message',{
					type: 6,
					msg: '轮到玩家【'+nextName+'】发言'
				});				
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
				return false;	
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
		var userID = data._userID;
		var voteToName = data._voteToName;
		var voteToID = data._voteToID;

		var user_temp = rooms.getUser(roomName,userID);
		var room_temp = rooms.getRoom(roomName);
		if(typeof user_temp.errType != 'undefined'){
			//房间不存在
			socket.emit('err',{
				msg : user_temp.err,
			});
			return false;
		}
		if(user_temp.isVote){
			//已经投过票
			socket.emit('err',{
				msg : '已经投过票不能重复投票'
			});
			return false;
		}
		if(user_temp.isOut){
			//投票的玩家是已经出局了
			socket.emit('err',{
				msg: '你已经出局，不能投票！'
			});
			return false;
		}

		if(voteToID){
			var beVote_temp = rooms.getUser(roomName,voteToID);
			if(typeof beVote_temp.errType != 'undefined'){
				//所投的用户并未在该房间内
				socket.emit('err',{
					msg : beVote_temp.errType
				});
				return false;
			}
			if(beVote_temp.isOut){
				//被投的玩家已经出局了
				socket.emit('err',{
					msg: '被投的玩家已经出局！不能投给该玩家'
				});
				return false;
			}
			beVote_temp.beVoted();
		}
		user_temp.voteTo();

		//广播
		io.sockets.in(roomName).emit('Message',{
			type: 7,
			msg : '玩家【'+userName+'】投给了玩家【'+voteToName+'】',
		});

		//所有玩家投过票
		if(room_temp.isAllVote()){
			//onVoteEnd返回的数据如下{max_vote_name:max_vote_name,max_vote:max_vote,max_repeat:max_repeat}
			var vote_data = room_temp.onVoteEnd();
			if(vote_data.max_repeat == 1 && vote_data.max_vote_name.length != 0){
				//只有一个玩家最高票
				io.sockets.in(roomName).emit('Message',{
					type: 8,
					msg: '玩家【'+vote_data.max_vote_name[0]+'】获得最高票数出局'
				});
				//玩家出局
				io.sockets.in(roomName).emit('voteOut',{
					_userName:　vote_data.max_vote_name[0],
					_userID: vote_data.max_vote_id[0],
				});
				//清除pk状态
				if(room_temp._isPK){
					room_temp.endPKTurn();
				}
				//是否满足游戏结束条件
				var gameover_temp = room_temp.isGameOver();
				if(gameover_temp){
					//发送游戏结束
					io.sockets.in(roomName).emit('gameOver',{
						msg : gameover_temp[1]
					});
					//游戏结束复位处理
					room_temp.onGameOver(gameover_temp[0]);
				}
				else{
					//游戏尚未结束
					var nextName = room_temp.getNextPlayer();
					if(nextName){
						//下一个玩家发言
						io.sockets.in(roomName).emit('Message',{
							type: 6,
							msg: '轮到玩家【'+nextName+'】发言'
						});				
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
						return false;
					}
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
				return false;
			}
		}
	});

	/*
		guess word
		猜词
	*/
	socket.on('guessWord',function(data){
		//data 格式 {_word: word,_roomName:name,_userName:name}
		var word_temp = data._word;
		var roomName = data._roomName;
		var userName = data._userName;
		var userID = data._userID;
		//获取房间对象
		var room_temp = rooms.getRoom(roomName);
		if(!room_temp){
			socket.emit('err',{
				//获取不到房间，即该房间不存在
				type: 1,
				msg: '房间不存在'
			});
			return;
		}
		var user_temp = rooms.getUser(roomName,userID);
		if(user_temp.errType){
			//获取不到用户，即用户不在该房间内
			socket.emit('err',{
				type: 3,
				msg: '并未加入该房间'
			});
			return;
		}
		if(!user_temp.isGhost()){
			//玩家不是鬼身份
			socket.emit('err',{
				type: 4,
				msg: '身份并不是鬼'
			});
			return;
		}
		//向房间发送猜词信息
		io.sockets.in(roomName).emit('Message', {
			type: 9,
			msg: '玩家【'+userName+'】进行猜词'
		});
		//有参数代表猜词
		var gameover_temp = room_temp.isGameOver(word_temp);
		if(gameover_temp){
			//猜对词
			io.sockets.in(roomName).emit('gameOver',{
				type: 1,
				msg: '玩家猜对词'
			});
			//复位处理
			room_temp.onGameOver(1);
			return;
		}
		else{
			//猜错词,玩家出局
			user_temp.outGame();
			io.sockets.in(roomName).emit('guessWordFail',{
				_userName: userName,
				msg: '玩家【'+userName+'】猜词错误，出局'
			});
			//游戏是否结束
			var temp = room_temp.isGameOver();
			if(temp){
				io.sockets.in(roomName).emit('gameOver',{
					type: temp[0],
					msg: temp[1]
				});
				room_temp.onGameOver(temp[0]);
				return;
			}
			else{
				//继续下一个玩家
				if(room_temp.getNextPlayer() == userName){
					//玩家在自己的发言回合猜词
					//相当于直接跳过发言
					user_temp.makeStatement();
					var name = room_temp.getNextPlayer();
					io.sockets.emit('Message',{
						type: 6,
						msg: '轮到玩家【'+name+"】发言",
					});
					io.sockets.emit('makeStatement',{
						_userName: name,
					});
					return;
				}
			}
		}
	});
}

/*
	gameover type
	游戏结束类型
	type:1	msg:猜对词
	type:2	msg:未能在3轮内票死一个，根据规则，鬼胜利
	type:3	鬼已全部出局，平民胜利
	type:4	平民和白痴总和人数等于鬼的人数，鬼胜利
*/

/*
	Message type
	消息类型
	type:1	msg:玩家加入或离开房间
	type:2	msg:玩家准备游戏
	type:3	msg:XX玩家开始发言
	type:4	msg:玩家发言陈述：内容
	type:5	msg:开始投票
	type:6	msg:轮到XX玩家发言
	type:7	msg:玩家XX投给了XX
	type:8	msg:玩家XX出局
	type:9	msg:玩家猜词
*/
