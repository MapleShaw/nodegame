var mongodb = require('./db');

exports.Topic = function(topic){
    this.words = topic.words;
    this.feature = topic.feature;
}

exports.Topic.get = function get(yourFeature, callback) {
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('subjects', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      collection.findOne({feature: yourFeature}, function(err, doc) {
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
      collection.insert(newTopic, {safe: true}, function(err, yourTopic) {
        mongodb.close();
        callback(err, yourTopic);
      });
    });
  });
};
