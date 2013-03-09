
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
        err = "User is not existed!";
        _callback (err);
      }
      if (user.password != password) {
        err = "Password is wrong!";
        _callback (err);
      }
      req.session.user = user;

      // req.flash('success', '登入成功');
      // res.redirect('/');
      
      _callback(user.name);


    });

    function _callback (_data) {
		//do something of the return "_data"
		res.json({
			data : _data
		});
	}
}


exports.loginout = function(req, res){
  req.session.user = null;
  res.redirect('/');
}


