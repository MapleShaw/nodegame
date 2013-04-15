var mongodb = require('./db');

exports.User = function(user) {
  this.name = user.name;
  this.email = user.email;
  this.password = user.password;
  this.systemid =  user.systemid;
  this.friendList = user.friendList;
  this.winRate = user.winRate;
  this.level = user.level;
  this.totalScroe = user.totalScroe;
  this.totalRounds = user.totalRounds;
  this.winRounds = user.winRounds;
};

exports.Friend = function(user) {
  this.name = user.name;
  this.systemid =  user.systemid;
};

exports.User.prototype.save = function save(callback) {
  // 存入 Mongodb 的文檔
  var user = {
    name: this.name,
    email: this.email,
    password: this.password,
    systemid: this.systemid,
    friendList: [],
    winRate:this.winRate,
    level:this.level,
    totalScroe:this.totalScroe,
    totalRounds:this.totalRounds,
    winRounds:this.winRounds,
    //isOnline
    //isOnGame
  };

  // var myselfInfo = {
  //   name: user.name,
  //   systemid: user.systemid,
  // }
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    // 讀取 users 集合
    db.collection('users', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      // 爲 name 屬性添加索引
      collection.ensureIndex('name', {unique: true});
      
      //用戶註冊時自動作為好友加入到其他用戶好友列表中
      // collection.update({},{$push:{"friendList":myselfInfo}},{multi:true},function (err, cursor) {
      
      // });
      // 寫入 user 文檔      
      collection.insert(user, {safe: true}, function(err, user) {
        mongodb.close();
        callback(err, user);
      });
    });
  });
};
exports.User.get = function get(username, callback) {
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    // 讀取 users 集合
    db.collection('users', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      // 查找 name 屬性爲 username 的文檔
      collection.findOne({name: username}, function(err, doc) {
        mongodb.close();
        if (doc) {
          // 封裝文檔爲 User 對象
          var user = new exports.User(doc);
          callback(err, user);
        } else {
          callback(err, null);
        }
      });
    });
  });
};
//更新用户信息
exports.User.prototype.update = function update(systemid,winRate,level,callback) {
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    // 讀取 users 集合
    db.collection('users', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }

      // 更新 user 文檔      
      collection.update({systemid:systemid}, {$set:{winRate:winRate,level:level}}, function(err) {
        mongodb.close();
        if(err){
          callback(err);
        }else{
          callback("susseed!");
        }
        
      });
    });
  });
}
exports.User.check = function ckeck(systemid, callback) {
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    // 讀取 users 集合
    db.collection('users', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      
      collection.findOne({systemid: systemid}, function(err, doc) {
        mongodb.close();
        if (doc) {
          err = 0;
          callback(err);
        }
      });
    });
  });
};

//加好友
exports.Friend.prototype.addFriend = function addFriend(hostId,callback) {
  // 存入 Mongodb 的文檔

  var myselfInfo = {
    name: this.name,
    systemid: this.systemid,
  }
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    // 讀取 users 集合
    db.collection('users', function(err, collection) {
      
      collection.update({"systemid":hostId},{$push:{"friendList":myselfInfo}},{multi:true},function (err, cursor) {
        mongodb.close();
        return callback(myselfInfo);
      });
    });
  });
};
//删除好友
exports.Friend.prototype.removeFriend = function removeFriend(hostId,callback) {
  // 存入 Mongodb 的文檔

  var myselfInfo = {
    name: this.name,
    systemid: this.systemid,
  }
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    // 讀取 users 集合
    db.collection('users', function(err, collection) {
      collection.update({"systemid":hostId},{$pull:{"friendList":myselfInfo}},{multi:true},function (err, cursor) {
        mongodb.close();
        return callback(myselfInfo);
      });
    });
  });
};

exports.Friend.get = function get(systemid, selfId, callback) {
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    // 讀取 users 集合
    db.collection('users', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      // 查找 name 屬性爲 username 的文檔
      collection.findOne({systemid:selfId},function(err,doc){console.log(systemid);
        for (var i = 0; i < doc.friendList.length; i++) {
          if(doc.friendList[i].systemid==systemid){
            err = 0;           
          }
        };
        mongodb.close();
        callback(err);
        
      });
     
      
    });
  });
};
