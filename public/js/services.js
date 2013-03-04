'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', []).
  value('version', '0.1').
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
        socket.get(dataName, dataVal, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        })
      }
    };
  });
