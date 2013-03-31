/*
	Manage the Rooms
	房间管理逻辑
*/
module.exports = function(socket,rooms,io){
	/*
		Room Constructor
		房间构造
	*/
	function RoomStructure(_roomName){
		//房间名
		this._roomName = _roomName;
		//房间游戏状态
		this._state = false;
		//房间已加入人数
		this._count = 0;
		//房间桌子加入的位置状态
		this._indexLocation = [0,0,0,0,0,0,0,0,0];
		//房间已准备人数
		this._prepareCount = 0;
		//房间成员
		this._roomMember = {};
		//游戏过程的顺序
		this._sequence = [];
		//游戏的轮数
		this._turns = 0;
		//是否在Pk环节
		this._isPK = false;
		//pk轮数
		this._pkTurns = 0;
		//pk成员
		this._pkMember = [];
		//游戏谜底
		this._answer = null;
		//游戏为结束离开房间的玩家
		this._leaveMember = [];
	}
	RoomStructure.prototype = {
		//构造指针
		constructor : RoomStructure,

		//玩家加进房间
		userConnect : function(userID){
			if(this.isRoomFull()){
				return '该房间人数已满';
			}
			else if(this._state){
				return '该房间已经开始游戏';
			}
			else{
				//将玩家顺序保存到数组中
				this._sequence.push(userID);
				this.addMember(userID);
				return true;
			}
		},

		//获取房间桌子是否有人的状态
		getDeskStatus : function(){
			return this._indexLocation;
		},

		//设置房间桌子是否有人的状态
		toggleDeskStatus : function(index){
			if(this._indexLocation[index]){
				this._indexLocation[index] = 0;
			}
			else{
				this._indexLocation[index] = 1;
			}
		},

		//获取房间成员列表,玩家放在数组第一个
		getRoomMemberList : function(){
			var sequence = this._sequence;
			var newList = [];
			for(var i = 0; i < sequence.length; i ++){
				var temp = this._roomMember[sequence[i]].userInfo;
				newList[i] = temp;
				newList[i].systemID = sequence[i];
				newList[i].isPrepare = this._roomMember[sequence[i]].isPrepare;
			}
			return newList;
		},

		//添加成员
		addMember : function(userID){
			this._count ++;
			this._roomMember[userID] = new UserStructure();
		},

		//删除成员
		deleteMember : function(userID){
			this._count --;
			this._prepareCount --;
			//从保存的顺序中删除该用户
			var sequence = this._sequence;
			for(var i = 0;i < sequence.length;i ++){
				if(sequence[i] == userID){
					sequence.splice(i,1);
					break ;
				}
			}
			delete this._roomMember[userID];
		},

		//房间是否人满
		isRoomFull : function(){
			if(this._count >= 9){
				return true;
			}
			else{
				return false;
			}
		},

		//是否为空房间，即人数为0
		isEmpty : function(){
			if(this._count == 0){
				return true;
			}
			else{
				return false;
			}
		},

		//玩家准备
		userPrepare : function(userID){
			if(this._prepareCount >= 9){
				return -1;
			}
			else{
				this._prepareCount ++;
				this._roomMember[userID].isPrepare = true;
				return this;
			}
		},

		//所有玩家都已准备
		isAllPrepare : function(){
			if(this._prepareCount == 9){
				return true;
			}
			else{
				return false;
			}
		},

		//房间游戏状态
		setRoomState : function(state){
			this._state = state;
		},

		//房间开始游戏
		onGameStart : function(){
			//获取、分配题目
			this.distributeSubject(this.getSubject(),this._roomMember);
			//随机指定玩家开始发言
			var _length = this._sequence.length;
			var random = Math.floor(Math.random()*_length);
			for(var i = 0;i < random;i ++){
				this._sequence.push(this._sequence.shift());
			}
			//房间状态设为开始
			this.setRoomState('start');
		},

		//获取题目
		getSubject : function(){
			var word = {
				answer : '红茶' ,
				similar : '绿茶' ,
				feature : '饮料' ,
				wordLength :　2,
			};
			//保存到房间
			this._answer = word.answer;
			return word;
		},

		//题目分配
		distributeSubject : function(subject,roomMember){
			var arr = [0,0,0,0,0,1,2,2,2];
			for(var item in roomMember){
				//随机数
				var _random = Math.floor(Math.random()*arr.length);
				//身份
				roomMember[item].identity = arr[_random];
				//词
				if (arr[_random] == 0) {
					roomMember[item].word = subject.answer;
				}
				else if (arr[_random] == 1) {
					roomMember[item].word = subject.similar;
				}
				else {
					roomMember[item].word = subject.feature;
					roomMember[item].wordLength = subject.wordLength;
				}
				//从数组中删除已分配的
				arr.splice(_random,1);
			}
			return roomMember;
		},

		//下一个玩家发言,返回玩家名字
		getNextPlayer : function(){
			if(this._isPK){
				for(var i = 0;i < this._pkMember.length;i ++){
					var item = this._pkMember[i];
					var user = this._roomMember[item];
					if(!user.isSay && !user.isOut){
						return this.getNameByID(item);
					}
				}
				return false;
			}
			else{
				var member = this._roomMember;
				var sequence = this._sequence;
				for (var i = 0;i < sequence.length;i ++){
					if(member[sequence[i]].isSay || member[sequence[i]].isOut){
						continue;
					}
					else{
						return this.getNameByID(sequence[i]);
					}
				}
				return false;
			}
		},

		//通过ID获取用户名
		getNameByID : function(userID){
			return this._roomMember[userID].userInfo.userName;
		},

		//判断是否所有玩家发过言
		isStatementOver : function(){
			if(this._isPK){
				//PK环节
				for(var i = 0;i < this._pkMember.length;i ++){
					var item = this._pkMember[i];
					if(this._roomMember[item].isSay == false){
						return false;
					}
				}
				return true;
			}
			else{
				//非PK环节
				var member = this._roomMember;
				for(var item in member){
					if(member[item].isSay == false && member[item].isOut == false){
						return false;
					}
				}
				return true;
			}
		},

		//发言回合结束
		onStatementOver : function(){
			var temp = this._roomMember;
			for(var item in temp){
				temp[item].isSay = false;
			}
			if(this._isPK){
				this._pkTurns ++;
			}
			else{
				this._turns ++;
			}
		},

		//判断是否所有玩家已投过票
		isAllVote : function(){
			if(this._isPK){
				//pk环节
				for (var i = 0;i < this._pkMember.length;i ++){
					var item = this._pkMember[i];
					if(this._roomMember[item].isVote == false){
						return false;
					}
				}
				return true;
			}
			else{
				//非pk环节
				var member = this._roomMember;
				for (var item in member){
					if (member[item].isVote == false && member[item].isOut == false) {
						return false;
					}
				}
				return true;
			}
		},

		//获取当前的所有用户的票数
		getAllVoteCount : function(){
			//格式 {id:1,id:2,id:3}
			var result = {};
			for(var item in this._roomMember){
				result[item] = this._roomMember[item].voteCount;
			}
			return result;
		},

		//投票回合结束,返回最高票数者的名字,票数
		onVoteEnd : function(){
			var result = {};
			//最高票数名字
			var max_vote_name = [];
			//最高票数ID
			var max_vote_id = [];
			//最高票数
			var max_vote = 0;
			//最高票数重复次数
			var max_repeat = 1;
			//获得最高票数
			var getHighest = function(user){
				if(user.voteCount > max_vote && user.isOut == false){
					max_vote_id = [];
					max_vote = user.voteCount;
					max_vote_id.push(item);
					max_repeat = 1;
				}
				else if(user.voteCount == max_vote && user.isOut == false){
					max_repeat ++;
					max_vote_id.push(item);
				}
				user.isVote = false;
				user.voteCount = 0;
			}
			if(this._isPK){
				//pk环节
				for(var i = 0;i < this._pkMember.length;i ++){
					var item = this._pkMember[i];
					var user = this._roomMember[item];
					getHighest(user);
				}
			}
			else{
				//非pk环节
				var member = this._roomMember;
				for (var item in member){
					var user = member[item];
					getHighest(user);
				}
			}
			//最高票数者出局（唯一最高票数的情况下）
			if(max_repeat == 1){
				member[max_vote_id[0]].outGame();
				//最高票数者出局后，发言的第一位从出局的下一位开始
				var sequence = this._sequence;
				var name = max_vote_id[0];
				for(var i = 0; i < sequence.length; i ++){
					if(sequence[0] == name){
						break;
					}
					else{
						sequence.push(sequence.shift());
					}
				}
			}
			//重复票数
			if(max_repeat > 1){
				this._pkMember = max_vote_id;
			}
			for(var j = 0; j < max_vote_id.length; j++){
				max_vote_name[j] = this.getNameByID(max_vote_id[j]);
			}
			result = {
				max_vote_id: max_vote_id,
				max_vote: max_vote,
				max_repeat: max_repeat,
				max_vote_name: max_vote_name,
			};
			return result;
		},

		//进入pk环节
		onPKTurn : function(arr){
			this._isPK = true;
			this._pkTurns ++;	
			this._pkMember = arr;
		},

		//结束pk环节
		endPKTurn : function(){
			this._isPK = false;
			this._pkTurns = 0;
			this._pkMember = [];
		},

		//是否满足游戏结束条件
		isGameOver : function(word){
			//有参数代表是猜词,无参数按正常逻辑处理
			if(!word){
				if(this._isPK && this._pkTurns == 3){
					return [2,'未能在3轮内票死一个，根据规则，鬼胜利'];
				}
				var member = this._roomMember;
				//人阵营人数
				var human_count = 0;
				//鬼阵营人数
				var ghost_count = 0;
				for(var item in member){
					var user = member[item];
					if(!user.isOut){
						//人阵营
						if(user.identity < 2){
							human_count ++ ;
						}
						//鬼阵营
						else{
							ghost_count ++ ;
						}
					}
				}
				if (ghost_count == 0) {
					return [3,'鬼已全部出局，平民胜利'];
				}
				if (ghost_count == human_count && ghost_count != 0) {
					return [4,'平民和白痴总和人数等于鬼的人数，鬼胜利'];
				}
				return false;
			}
			else{
				//猜词
				if(this._answer = word){
					return true;
				}
				else{
					return false;
				}
			}
		},

		//更新房间内用户的分数等级
		updateScores : function(){
			for(var item in this._roomMember){
				this._roomMember[item].calculateScores(this._roomMember);
			}
		},

		//房间游戏结束,type为胜利的某一方
		onGameOver : function(type){
			var member = this._roomMember;
			//玩家复位,记录游戏结果
			for(var item in member){
				if(type == 3){
					//人阵营胜利
					if(member[item].identity < 2){
						member[item].gameResult = true;
						member[item].basicScores = 2;
					}
					else{
						member[item].gameResult = false;
						member[item].basicScores = -2;
					}
				}
				else{
					//鬼阵营胜利
					if(member[item].identity == 2){
						member[item].gameResult = true;
						member[item].basicScores = 2;
					}
					else{
						member[item].gameResult = false;
						member[item].basicScores = -2;
					}
				}
			}
			//更新分数
			this.updateScores();
			//返回所有游戏结果信息
			var result = this.getGameResultInfo();
			//玩家信息重置
			this.resetUserState();
			//房间复位
			this._state = false;
			this._prepareCount = 0;
			this._turns = 0;
			this._isPK = false;
			this._pkMember = [];
			this._answer = null;

			return result;
		},

		//重置所有用户状态
		resetUserState : function(){
			//先清除游戏过程中离开房间的玩家
			for(var i = 0; i < this._leaveMember.length; i ++){
				this.deleteMember(this._leaveMember[i]);
			}
			//再对房间里每个用户重置状态
			for(var item in this._roomMember){
				this._roomMember[item].resetState();
			}
		},

		//获取游戏结果信息
		getGameResultInfo : function(){
			var member = this._roomMember;
			var result = [];
			for(var item in member){
				//每个对象包含ID，Name，identity，Word，WordLength，isWin，Score，rewardScore
				var itemResult = {};
				itemResult.userID = item;
				itemResult.userName = member[item].userInfo.userName;
				itemResult.identity = member[item].identity;
				itemResult.word = member[item].word;
				if(!itemResult.wordLength){
					itemResult.wordLength = "";
				}
				else{
					itemResult.wordLength = member[item].wordLength;
				}
				itemResult.isWin = member[item].gameResult;
				itemResult.score = member[item].basicScores;
				itemResult.rewardScore = member[item].rewardPoints;
				//保存到数组
				result.push(itemResult);
			}
			return result;
		},
	};

	/*
		User Structure
		游戏中用户构造
	*/
	function UserStructure(){
		//玩家身份 0:平民 1:白痴 2:鬼
		this.identity = null;
		//玩家拿到的词语
		this.word = null;
		//词语长度
		this.wordLength = null;
		//是否已经准备
		this.isPrepare = false;
		//是否已经发言
		this.isSay = false;
		//是否已经投票
		this.isVote = false;
		//投票得到的票数
		this.voteCount = 0;
		//是否已出局
		this.isOut = false;
		//游戏结果
		this.gameResult = null;
		//基本分
		this.basicScores = 0;
		//玩家游戏奖励积分
		this.rewardPoints = 0;
		//玩家资料
		this.userInfo = {
			// winRate : null,
			// level : null,
			// userName : null,
		};
		//是否逃跑
		this.isRun = false;
		//出局的轮数
		this.outGameTurn = 0;
		//每次投票投给的ID
		this.voteToAsID = [];
	}
	UserStructure.prototype = {
		//构造指针
		constructor : UserStructure,

		//获取玩家资料
		getUserInfo : function(userID){
			return this.userInfo;
		},

		//发言
		makeStatement : function(){
			this.isSay = true;
		},

		voteTo : function(userID){
			this.isVote = true;
			this.voteToAsID.push(userID);
		},

		//被投票
		beVoted : function(){
			this.voteCount ++ ;
		},

		//是否为鬼身份
		isGhost : function(){
			if(this.identity == 2){
				return true;
			}
			else{
				return false;
			}
		},

		//猜对词
		guessRightWord : function(){
			this.rewardPoints += 2;
		},

		//玩家出局
		outGame : function(turns){
			this.isOut = true;
			this.outGameTurn = turns;
		},


		//积分奖励
		calculateRewardPoints : function(roomMember){
			if(this.identity == 0){
				//平民如果胜利且并未出局，投的每个是鬼，则加两分
				if(this.gameResult && !this.isOut){
					for(var i = 0; i < this.voteToAsID.length; i++){
						if(roomMember[this.voteToAsID[i]].identity != 2){
							//投的有不是鬼的
							return 0;
						}
					}
					//加2分
					this.rewardPoints += 2;
					return ;
				}
				//平民输了但是平民没投过鬼
				else{
					for(var i = 0; i < this.voteToAsID.length; i++){
						if(roomMember[this.voteToAsID[i]].identity == 2){
							//有投过鬼
							if(this.outGameTurn < 3){
								//3轮内出局
								this.rewardPoints = -1;
							}
							return 0;
						}
						//扣一分
						this.rewardPoints = -1;
						return;
					}
				}
			}
			else if(this.identity == 1){
				//白痴胜利且白痴并未出局加一分
				if(this.gameResult && !this.isOut){
					this.rewardPoints += 1;
					return ;
				}
			}
			else{
				//鬼胜利(猜词猜中)
				//没出局
				if(this.gameResult && !this.isOut){
					this.rewardPoints += 1;
					return ;
				}
				else{
					if(this.voteToAsID.length == this.outGameTurn && this.outGameTurn > 6){
						//坚持到最后一轮
						this.rewardPoints += 1;
					}
					return ;
				}
			}
		},

		//重置游戏记录的相关数据
		resetState : function(){
			this.identity = null;
			this.word = null;
			this.wordLength = null;
			this.isSay = false;
			this.isVote = false;
			this.voteCount = 0;
			this.isOut = false;
			this.gameResult = null;
			this.basicScores = 0;
			this.rewardPoints = 0;
			this.isRun = false;
			this.outGameTurn = 0;
			this.voteToAsID = [];
			this.isPrepare = false;
		},

		//计算玩家分数
		calculateScores : function(roomMember){
			//先计算奖励分数
			this.calculateRewardPoints(roomMember);
			//更新到数据库
		},
	};


	/*
		New Room
		创建新房间
	*/
	socket.on('createRoom',function(data){
		//data 格式 ：{_roomName : roomname  , _userName : username}
		var roomName = data._roomName;
		if(rooms.isRoomExist(roomName)){
			//房间已存在
			socket.emit('err',{
				type: 2,
				msg : '房间已存在'
			});
			return -1;
		}
		else{
			var _newRoom = new RoomStructure(roomName);	
			//add to the roomlist
			rooms.addRoom(_newRoom);
			//创建成功
			socket.emit('createRoomSuccess',{
				type: 1,
			});
			//给所有人发送
			io.sockets.emit('newRoom',{
				_roomName : roomName,
			});
			return 1;
		}
	});

	/*
		Get Room List
		获得房间列表
	*/
	socket.on('getRoomList',function(data){
		var list = rooms.getRoomListAndIndex();
		socket.emit('onRoomList',{
			//list的格式 [{roomName:name,index:[location]},{},{}]
			_list : list,
		});
	});

	/*
		Join Room
		加入房间
	*/
	socket.on('joinRoom',function(data){
		//data 格式 {_roomName : name , _userName : name,_userID: userID}
		var roomName = data._roomName;
		var userName = data._userName;
		var userID = data._userID;
		var roomIndex = data._location;
		var room_temp = rooms.getRoom(roomName);
		var userInfo = data._userInfo;
		if(room_temp){
			var temp = room_temp.userConnect(userID);	
			if (typeof temp == 'string') {
				//人满或房间已开始游戏
				socket.emit('err',{
					type: -1,
					msg : temp
				});
				return ;
			}
			else{
				socket.join(data._roomName);
				//添加用户信息
				var user_temp = rooms.getUser(roomName,userID);
				user_temp.userInfo = userInfo;
				//设置桌子状态
				room_temp.toggleDeskStatus(roomIndex);
				//加入房间成功
				socket.emit('joinRoomSuccess',{
					type: 1,
				});
				//广播
				io.sockets.in(roomName).emit('Message',{
					type: 1,
					msg : '玩家【'+userName+'】加入了房间',
				});
				//更新房间状态
				io.sockets.emit('updateRoomStatus',{
					_roomName: roomName,
					_userName: userName,
					_location: roomIndex,
					_type: 1,
				});
				//给该房间的所有用户发送用户列表信息
				var list_temp = room_temp.getRoomMemberList();
				io.sockets.in(roomName).emit('updateRoomMember',{
					_type: 0,
					_list: list_temp,
				});
			}
		}
		else{
			socket.emit('err',{
				type: 1,
				msg : '房间不存在'
			});
			return ;
		}
	});

	/*
		Leave Room
		离开房间
	*/
	socket.on('leaveRoom',function(data){
		var roomName = data._roomName;
		var userName = data._userName;
		var userID = data._userID;
		var roomIndex = data._location;
		//离开房间
		socket.leave(roomName);
		var room = rooms.getRoom(roomName);
		var user = rooms.getUser(roomName,userID);
		if(typeof user.errType == 'undefined'){
			if(!room._state){
				//房间未开始游戏
				room.deleteMember(userID);
			}
			else{
				//房间正在游戏，保存到数组中，游戏结束后再统一处理
				room._leaveMember.push(userID);
			}
			//成功离开房间
			socket.emit('leaveSuccess',{});
		}
		//房间人数为0时删除房间
		if(room.isEmpty()){
			rooms.deleteRoom(roomName);
			//广播
			io.sockets.emit('deleteRoom',{
				_roomName: roomName
			});
		}
		//设置桌子状态
		room.toggleDeskStatus(roomIndex);
		//用户离开房间
		io.sockets.in(roomName).emit('Message',{
			type: 1,
			msg: '用户【'+userName+'】离开了房间',
		});
		//给所有人发送
		io.sockets.emit('updateRoomStatus',{
			_roomName: roomName,
			_userName: userName,
			_location: roomIndex,
			_type: -1,
		});
		//给用户离开的房间里的成员发送
		var list_temp = room.getRoomMemberList();
		io.sockets.in(roomName).emit('updateRoomMember',{
			_type: 1,
			_list: list_temp,
		});
	});

	/*
		Disconnect
		玩家断开连接
	*/
	socket.on('disconnect',function(){
		//判断玩家是否加入了房间
		//判断玩家是否有在游戏中
	});
}
