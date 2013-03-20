
var crypto = require('crypto');
var user = require('../models/user');

exports.login = function(req, res){
	//
	
	var data = req.body;
	//生成口令的散列值
    var md5 = crypto.createHash('md5');
    var password = md5.update(data.password).digest('base64');
    
    user.User.get(data.username, function(err, user) {
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
          //console.log(user);
          _callback (err,user);
          
        }
      }
      
      

    });

    function _callback (_err,_user) {
		//do something of the return "_data"
    if(_err==1||_err==2){
      res.json({
        err : _err
      });
    }else if(_err==0){
      res.json({
        err : _err,
        myselfInfo : {name:_user.name,systemid:_user.systemid},
        friendList : _user.friendList ? _user.friendList : []
      });
    }
		
	}
}


exports.loginout = function(req, res){
  req.session.user = null;
  res.redirect('/');
}


