var mongodb = require('./db');

function User(user) {
  this.name = user.name;
  this.email = user.email;
  this.password = user.password;
  this.systemid =  user.systemid;
  this.friendList = user.friendList;
  this.mark = user.mark;
};
module.exports = User;

User.prototype.save = function save(callback) {
  // 存入 Mongodb 的文檔
  var user = {
    name: this.name,
    email: this.email,
    password: this.password,
    systemid: this.systemid,
    friendList: [],
    mark: this.mark,
    //isOnline
    //isOnGame
  };

  var myselfInfo = {
    name: user.name,
    systemid: user.systemid,
  }
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
      
      //
      collection.update({"mark":0},{$push:{"friendList":myselfInfo}},{multi:true},function (err, cursor) {
      
      });
      // 寫入 user 文檔
      
      collection.insert(user, {safe: true}, function(err, user) {
        mongodb.close();
        callback(err, user);
      });
    });
  });
};

User.get = function get(username, callback) {
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
          var user = new User(doc);
          callback(err, user);
        } else {
          callback(err, null);
        }
      });
    });
  });
};
