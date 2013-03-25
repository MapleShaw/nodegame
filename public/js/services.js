'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', []).
  //game version
  value('gameVersion', '0.1').
  //socket factory
  factory('socket', function ($rootScope) {
    var socket = io.connect();
    return {
      //just send data
      //use socket
      send : function (dataVal) {
        socket.send(dataVal);
      },
      //listen event with "on" method
      on : function (eventName, callback) {
        socket.on(eventName, function () {  
          var args = arguments;
          $rootScope.$apply(function () {
            callback.apply(socket, args);
          });
        });
      },
      //send msg with "broadcast" method
      broadcast : function (eventName, data, callback) {
        socket.broadcast.emit(eventName, data, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        })
      },
      //send msg with "emit" method
      emit : function (eventName, data, callback) {
        socket.emit(eventName, data, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        })
      },
      //set and get
      //Storing data associated to a client
      //Sometimes it's necessary to store data associated with a
      //client that's necessary for the duration of the session.
      set : function (dataName, dataVal, callback) {
        socket.set(dataName, dataVal, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        })
      },
      get : function (dataName, dataVal, callback) {
        socket.get(dataName, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        })
      }
    };
  }).
  factory('global', function ($rootScope) {
    //
    return {
      _getTime : function () {
        var _date = new Date(),
            _year = _date.getFullYear(),
            _month = _date.getMonth() + 1,
            _day = _date.getDate(),
            _hours = _date.getHours(),
            _minutes = _date.getMinutes(),
            _seconds = _date.getSeconds();
        var _time = _year + '/' + _month + '/' + _day + ' ' + _hours + ':' + _minutes + ':' + _seconds;
        //return current time
        return _time;
      }
    }
  }).
  factory('localStorage', function () {
    return {
      set: function (storageName, storageVal) {
        localStorage.setItem(storageName, JSON.stringify(storageVal));
      },
      get: function (storageName) {
        return JSON.parse(localStorage.getItem(storageName) || false);
      },
      remove: function (storageName) {
        localStorage.removeItem(storageName);
      },
      clear: function () {
        localStorage.clear();
      }
    };
  }).
  factory('sessionStorage', function () {
    return {
      set: function (sessionName, sessionVal) {
        sessionStorage.setItem(sessionName, JSON.stringify(sessionVal));
      },
      get: function (sessionName) {
        return JSON.parse(sessionStorage.getItem(sessionName) || false);
      },
      remove: function (sessionName) {
        sessionStorage.removeItem(sessionName);
      },
      clear: function () {
        sessionStorage.clear();
      }
    };
  })
