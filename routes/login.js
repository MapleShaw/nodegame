
var crypto = require('crypto');
var User = require('../models/user');

exports.login = function(req, res){
	//
	
	var data = req.body;
	//生成口令的散列值
    var md5 = crypto.createHash('md5');
    var password = md5.update(data.password).digest('base64');
    
    User.get(data.username, function(err, user) {
      if (!user) {
        err = 1;
        _callback (err);
      }else{
        if (user.password != password) {
          err = 2;
          _callback (err);
        }else{
          req.session.user = user;
          err = 0;
          _callback (err,user);
          
        }
      }
      
      

    });

    function _callback (_err,_user) {
		//do something of the return "_data"
		res.json({
			err : _err,
      myselfInfo : {name:_user.name,systemid:_user.systemid},
      friendList : _user.friendList
		});
	}
}


exports.loginout = function(req, res){
  req.session.user = null;
  res.redirect('/');
}


