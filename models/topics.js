var mongodb = require('./db');

exports.Topic = function(topic){
    this.words = topic.words;
    this.feature = topic.feature;
    this.sort = topic.sort;
}

exports.Topic.getCount = function getCount(callback) {
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('subjects', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      collection.find(function (e, cursor) {
        
        cursor.count(function (e, count) {
          mongodb.close();
          randomNum = Math.random()*count;
          return callback(count);
        });
      });
      
    });
  });
};

exports.Topic.get = function get(sort, callback) {
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('subjects', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      
      collection.findOne({sort: sort}, function(err, doc) {
        mongodb.close();
        if (doc) {
          var topic = new exports.Topic(doc);
          callback(err, topic);
        } else {
          callback(err, null);
        }
      });
    });
  });
};

exports.Topic.add = function add(newTopic, callback) {

  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('subjects', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      var repeatMark;
      //查询特征词是否存在
      collection.findOne({feature: newTopic.feature}, function(err, doc) {
        if (doc) {
          var oldOne,isExist=[];
          for (var i = 0; i < doc.words.length; i++) {
            oldOne = doc.words[i];
            for (var j = 0; j < newTopic.words.length; j++) {
              if(oldOne==newTopic.words[j]){
                isExist.push(newTopic.words[j]);
                newTopic.words.splice(j,1);
              }
            }
          }
          if(newTopic.words.length!=0){
            for (var i = 0; i < newTopic.words.length; i++) {
              collection.update({"feature":newTopic.feature},{$push:{"words":newTopic.words[i]}}, function(err) {               
              });
            }
            mongodb.close();
          }
          if(isExist.length!=0){
            repeatMark=1;
          }else{
            repeatMark=0;
          }
          callback(err, isExist,repeatMark);         
        } else {
          repeatMark=0;
          collection.insert(newTopic, {safe: true}, function(err, yourTopic) {
            mongodb.close();
            callback(err, yourTopic,repeatMark);
          });
        }
      });
      
    });
  });
};
