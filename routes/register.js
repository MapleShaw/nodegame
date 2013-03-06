var crypto = require('crypto');
var User = require('../models/user');





exports.post = function(req, res){
	var _return = {};
	//the data of form (json)
	var data = req.body;
  //生成口令的散列值
  var md5 = crypto.createHash('md5');
  var password = md5.update(data.password).digest('base64');
  var newUser = new User({
    name: data.username,
    email: data.email,
    password: password,
  });
	//next is doing with the database of MongoDB
  //新增用戶 
  User.get(newUser.name, function(err, user) {
    newUser.save(function(err) {
      if (err) {
        
      }
      req.session.user = newUser;
    });
  });

	//the callback function of database if return something
	function _callback (_data) {
		//do something of the return "_data"
		res.json({
			data : _data
		});
	}
} ;

exports.check = function(req, res){
	var _return = {};
	//the data of form (json)
	var data = req.body;
  var newUser = new User({
    name: data.username
  });
	//next is doing with the database of MongoDB
	//......
	//......
  //檢查用戶名是否已經存在
  User.get(newUser.name, function(err, user) {
    if (user)
      err = 'Username already exists.';
      _callback(err);
  });

	//the callback function of database if return something
	function _callback (_data) {
		//do something of the return "_data"
		res.json({
			data : _data
		});
	}
} ;
