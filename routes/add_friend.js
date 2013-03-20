var user = require('../models/user');

//加好友
exports.add = function(req, res){
  var data = req.body;

  var newFriend = new user.Friend({
    name: data.username,
    systemid: data.systemid,
  });
  
  //新增好友 
  user.Friend.get(data.selfName, function(err) {
    newFriend.addFriend(data.selfName,function(err) {
      if (err) {
        _callback(err);
      }
      
    });
  });

  function _callback (_data) {
    res.json({
      data : _data
    });
  }
};
//删除好友
exports.remove = function(req, res){
  var data = req.body;

  var newFriend = new user.Friend({
    name: data.username,
    systemid: data.systemid,
  });
  
  //新增好友 
  user.Friend.get(data.selfName, function(err) {
    newFriend.removeFriend(data.selfName,function(err) {
      if (err) {
        _callback(err);
      }
      
    });
  });
  function _callback (_data) {
    res.json({
      data : _data
    });
  }
};