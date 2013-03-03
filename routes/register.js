



exports.post = function(req, res){
	var _return = {};
	//the data of form (json)
	var data = req.body;

	//next is doing with the database of MongoDB
	//......
	//......

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

	//next is doing with the database of MongoDB
	//......
	//......

	//the callback function of database if return something
	function _callback (_data) {
		//do something of the return "_data"
		res.json({
			data : _data
		});
	}
} ;
