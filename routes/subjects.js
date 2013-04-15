var topic = require('../models/topics');

// test = function(){
//   subjects.getSubject(function(subject){
//     console.log(subject);
//   });
// }

exports.getSubject = function(_callback){
  
  var subject = {};
  
  topic.Topic.getCount(function(count){
  	
  	var random,arrTmp=[],theSort=parseInt(Math.random()*count+1);                                 //随机数，缓存数组

      topic.Topic.get(theSort, function(err, doc) {
        
        if (!doc) {
          err = "不存在该特征词";
          
        }else{
          var arrWord = doc.words,getLength;
          
          for (var i = 0; i < 2; i++) {
            getLength = arrWord.length;
            random = parseInt(Math.random()*getLength);
            
            arrTmp.push(arrWord[random]);
            arrWord.splice(random,random);
          }
          subject.answer = arrTmp[0];
          subject.similar = arrTmp[1];
          subject.wordLength = arrTmp[0].length;
          subject.feature = doc.feature;
          _callback(subject);
          
        }
      });
  });  
  
}

exports.addSubject = function(req , res){
  topic.Topic.getCount(function(count){
    var data = {
      words:req.body.words,
      feature:req.body.feature,
      sort:count+1,
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
  });
  
}
