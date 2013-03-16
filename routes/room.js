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
	}
	RoomStructure.prototype = {
		//构造指针
		constructor : RoomStructure,

		//玩家加进房间
		userConnect : function(userName){
			if(this.isRoomFull()){
				return '该房间人数已满';
			}
			else if(this._state){
				return '该房间已经开始游戏';
			}
			else{
				//将玩家顺序保存到数组中
				this._sequence.push(userName);
				this.addMember(userName);
				return true;
			}
		},

		//获取房间桌子是否有人的状态
		getDeskStatus : function(){
			return this._indexLocation;
		},

		//设置房间桌子是否有人的状态
		toggleDeskStatus : function(index){
			var temp = this._indexLocation[index];
			if(temp){
				temp = 0;
			}
			else{
				temp = 1;
			}
		},

		//获取房间成员列表,玩家放在数组第一个
		getRoomMemberList : function(userName){
			var sequence = this._sequence;
			var newList = [];
			for(var i = 0; i < sequence.length; i ++){
				newList[i] = sequence[i];
			}
			for(var i = 0; i < sequence.length; i ++){
				if (newList[i] == userName) {
					return newList;
				}
				else{
					newList.push(newList.shift());
				}
			}
			return newList;
		},

		//添加成员
		addMember : function(userName){
			this._count ++;
			this._roomMember[userName] = {};
		},

		//删除成员
		deleteMember : function(userName){
			this._count --;
			//从保存的顺序中删除该用户
			var sequence = this._sequence;
			for(var i = 0;i < sequence.length;i ++){
				if(sequence[i] == userName){
					sequence.splice(i,1);
					break ;
				}
			}
			delete this._roomMember[userName];
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
		userPrepare : function(){
			if(this._prepareCount >= 9){
				return -1;
			}
			else{
				this._prepareCount ++;
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
			for(var item in this._roomMember){
				this._roomMember[item] = new UserStructure();
			}
			//获取、分配题目
			this.distributeSubject(this.getSubject(),this._roomMember);
			//随机指定玩家开始发言
			var arr = this._sequence;
			var random = Math.floor(Math.random()*arr.length);
			for(var i = 0;i < random;i ++){
				arr.push(arr.shift());
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
						return user;
					}
				}
				return -1;
			}
			else{
				var member = this._roomMember;
				var sequence = this._sequence;
				for (var i = 0;i < sequence.length;i ++){
					if(member[sequence[i]].isSay || member[sequence[i]].isOut){
						continue;
					}
					else{
						return sequence[i];
					}
				}
				return -1;
			}
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

		//投票回合结束,返回最高票数者的名字,票数
		onVoteEnd : function(){
			//最高票数名字
			var max_vote_name = [];
			//最高票数
			var max_vote = 0;
			//最高票数重复次数
			var max_repeat = 1;
			//获得最高票数
			var getHighest = function(user){
				if(user.voteCount > max_vote && user.isOut == false){
					max_vote_name = [];
					max_vote = user.voteCount;
					max_vote_name.push(item);
					max_repeat = 1;
				}
				else if(user.voteCount == max_vote && user.isOut == false){
					max_repeat ++;
					max_vote_name.push(item);
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
				member[max_vote_name[0]].isOut = true;
				//最高票数者出局后，发言的第一位从出局的下一位开始
				var sequence = this._sequence;
				var name = max_vote_name[0];
				for(var i = 0; i < sequence.length; i ++){
					if(sequence[i] == name){
						break;
					}
					else{
						sequence.push(sequence.shift());
					}
				}
			}
			return {max_vote_name : max_vote_name , max_vote : max_vote , max_repeat : max_repeat};					
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
			if(this._isPK && this._pkTurns == 3){
				return [true,'未能在3轮内票死一个，根据规则，鬼胜利'];
			}
			//有参数代表是猜词
			if(!word){
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
					return [true,'鬼已全部出局，平民胜利'];
				}
				if (ghost_count == human_count && ghost_count != 0) {
					return [true,'平民和白痴总和人数等于鬼的人数，鬼胜利'];
				}
				return false;
			}
		},

		//房间游戏结束
		onGameOver : function(){
			var member = this._roomMember;
			//玩家复位
			for(var item in member){
				member[item] = {};
			}
			//房间复位
			this._state = false;
			this._prepareCount = 0;
			this._turns = 0;
			this._isPK = false;
			this._pkMember = [];
			this._answer = null;
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
		//是否已经发言
		this.isSay = false;
		//是否已经投票
		this.isVote = false;
		//投票得到的票数
		this.voteCount = 0;
		//是否已被票出局
		this.isOut = false;
	}
	UserStructure.prototype = {
		//构造指针
		constructor : UserStructure,

		//发言
		makeStatement : function(){
			this.isSay = true;
		},

		voteTo : function(){
			this.isVote = true;
		},

		//被投票
		beVoted : function(){
			this.voteCount ++ ;
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
		//data 格式 {_roomName : name , _userName : name}
		var roomName = data._roomName;
		var userName = data._userName;
		var roomIndex = data._location;
		var room_temp = rooms.getRoom(roomName);
		if(room_temp){
			var temp = room_temp.userConnect(userName);	
			if (typeof temp == 'string') {
				//人满或房间已开始游戏
				socket.emit('err',{
					type: -1,
					msg : temp
				});
			}
			else{
				socket.join(data._roomName);
				//设置桌子状态
				room_temp.toggleDeskStatus(roomIndex);
				//广播
				io.sockets.in(data._roomName).emit('Message',{
					msg : '玩家【'+data._userName+'】加入了房间',
				});
				//更新房间状态
				io.sockets.emit('updateRoomStatus',{
					_roomName: roomName,
					_userName: userName,
					_location: roomIndex
				});
			}
		}
		else{
			socket.emit('err',{
				type: 1,
				msg : '房间不存在'
			});
		}
	});

	/*
		Leave Room
		离开房间
	*/
	socket.on('leaveRoom',function(data){
		var roomName = data._roomName;
		var userName = data._userName;
		socket.leave(roomName);
		var room = rooms.getRoom(roomName);
		var user = rooms.getUser(userName);
		if(typeof user.errType == 'undefined'){
			room.deleteMember(userName);
		}
		//房间人数为0时删除房间
		if(room.isEmpty()){
			rooms.deleteRoom(roomName);
		}
		//用户离开房间
		io.sockets.emit('userLeaveRoom',{
			_roomName: roomName,
			_userName: userName
		});
	});
}
