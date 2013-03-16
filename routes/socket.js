var Chat = require('./chat');
var Game = require('./game');
var Room = require('./room');


/*
	共用,公共
*/
//所有的socket
var sockets = {};
//所有的房间
var rooms = {
	//房间列表
	list : {},

	//房间是否存在
	isRoomExist : function(roomName){
		var all_room = this.list;
		if(typeof all_room[roomName] == 'object'){
			return true;
		}
		else{
			return false;
		}
	},

	//添加房间
	addRoom : function(room){
		var roomName = room._roomName ;
		this.list[roomName] = room;
	},

	//删除房间
	deleteRoom : function(roomName){
		var room = this.isRoomExist(roomName);
		if(room){
			delete this.list[roomName];
		}
		else{
			return false;
		}
	},

	//获取房间列表
	getRoomListAndIndex : function(){
		var arr = [];
		var list_temp = this.list;
		for(var item in list_temp){
			arr.push({roomName: item, index: list_temp[item].getDeskStatus()});
		}
		return arr;
	},

	//获取房间对象
	getRoom : function(roomName){
		var room = this.list[roomName];
		if (typeof room == 'object'){
			return room;
		}
		else {
			return false;
		}
	},

	//获取用户对象
	getUser : function(roomName,userName){
		var room_temp = this.list[roomName];
		if(typeof room_temp != 'object'){
			return {
				errType : -1,
				err : '该房间并不存在'
			};
		}

		var user_temp = room_temp._roomMember[userName];
		if(typeof user_temp != 'object'){
			return {
				errType : -2,
				err : '用户并不在该房间内'
			};
		}

		return user_temp;
	},
};


exports.onConnect = function(socket,io){
	/*
		聊天逻辑
	*/
	Chat(socket);

	/*
		游戏逻辑
	*/
	Game(socket,rooms,io);

	/*
		房间逻辑
	*/
	Room(socket,rooms,io);
};
