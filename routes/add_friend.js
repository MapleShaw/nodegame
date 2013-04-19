var user = require('../models/user');

//加好友
exports.add = function(req, res){
  var data = req.body;

  var newFriend = new user.Friend({
    name: data.username,
    systemid: data.systemid,
  });
  
  //新增好友 
  user.Friend.get(data.systemid, data.selfId, function(err) {
    if(err==0){
      var errTips="那位童鞋已经是你的好友了！！你妹！！";
      _callback(errTips);
    }else{
      
      newFriend.addFriend(data.selfId,function(friend) {
        if (friend) {
          _callback(friend);
        }
        
      });
    }
    
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
  user.Friend.get(data.systemid, data.selfId, function(err) {
    if(err==0){
      newFriend.removeFriend(data.selfId,function(friend) {
        if (friend) {
          _callback(friend);
        }       
      });
    }else{
      var errTips = "删你妹啊，他又不是你好友！！";
      _callback(errTips);
    }
    
  });
  function _callback (_data) {
    res.json({
      data : _data
    });
  }
};

exports.update = function(newUserInfo){
  var data = newUserInfo;
  var index = 0;
  var initUser = function () {
    var currentUser = new user.User({
      systemid: data[index].systemid, 
      winRate:data[index].winRate,
      level:data[index].level,
      score:data[index].score,
      totalTimes:data[index].totalTimes,
      winTimes:data[index].winTimes,
      failTimes:data[index].failTimes
    });
  }
  var updateInfo = function () {
    index++;
    if (index > 8) {
      return 0;
    } else {
      initUser();
      user.User.check(currentUser.systemid, function(tip) {
        if(tip==0){
          currentUser.update(currentUser.systemid, currentUser.winRate, currentUser.level, currentUser.score, currentUser.totalTimes, currentUser.failTimes, currentUser.winTimes, function(tips){
            _callback(tips);
            updateInfo();
          });
        }
      });
    }
  }
  initUser();
    
  function _callback (_data) {
    res.json({
      data : _data
    });
  }
}



