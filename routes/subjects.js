var topic = require('../models/topics');

exports.getSubject = function(feature , _callback){
	var subject = {};
	var random,arrTmp=[];                                 //随机数，缓存数组
    topic.Topic.get(feature, function(err, doc) {
      if (!doc) {
        err = "不存在该特征词";
        _callback (err);
      }else{
        var arrWord = doc.words,getLength;
        
        for (var i = 0; i < 2; i++) {
          getLength = arrWord.length;
          random = parseInt(Math.random()*getLength);
          
          arrTmp.push(arrWord[random]);
          arrWord.splice(random,random);
        }
        console.log(arrTmp);
        subject.answer = arrTmp[0];
        subject.similar = arrTmp[1];
        subject.wordLength = arrTmp[0].length;
        subject.feature = feature;
        _callback(subject);
        
      }
    });
}

exports.addSubject = function(req , res){
  var data = {
    words:req.body.words,
    feature:req.body.feature,
  };

  topic.Topic.add(data, function(err, repeatWords,repeatMark) {
    
    _callback(repeatWords,repeatMark);
  });

  function _callback (_repeatWords,_repeatMark) {
    res.json({
      repeatWords : _repeatWords,
      repeatMark : _repeatMark
    });
  }
}