'use strict';

/* Directives */


angular.module('myApp.directives', []).
  //game version
  directive('gameVersion', ['gameVersion', function(gameVersion) {
      return function(scope, elm, attrs) {
          //elm.text(gameVersion);
      };
    }]).
    //on-enter
    directive('onEnter', function() {
      //debugger;
      return function(scope, element, attrs) {
          element.bind("keydown", function(event) {
              if (event.which === 13) {
                  scope.$apply(function() {
                      scope.$eval(attrs.onEnter);
                  });
                  event.preventDefault();
              }
          });
      };
  }).
  //edit roomName blur event
  directive('roomNameBlur', function () {
    return function (scope, elem, attrs) {
      elem.bind('blur', function () {
        scope.$apply(attrs.roomNameBlur);
      });
    };
  }).
  //edit rooomName focus event
  directive('roomNameFocus', function ($timeout) {
    return function (scope, elem, attrs) {
      scope.$watch(attrs.roomNameFocus, function (newval) {
        if (newval) {
          $timeout(function () {
            elem[0].focus();
          }, 0, false);
        }
      });
    };
  }).
  //window drag
  directive('onDraggable', function($document, $window) {
    var startX = 0,
        startY = 0;
    return function(scope, element, attr) {
      var parent = element.parent("chatDialog");
      var x = parent[0].getAttribute("data-left");//parseInt(parent[0].style.left);
      var y = parent[0].getAttribute("data-top");//parseInt(parent[0].style.top);
      element.bind('mousedown', function(event) {
          startX = event.screenX - x;
          startY = event.screenY - y;
          $document.bind('mousemove', mousemove);
          $document.bind('mouseup', mouseup);
      });
      function mousemove(event) {
          y = event.screenY - startY;
          x = event.screenX - startX;
          if (x <= 0) {
            x = 0;
          } else if (x + parent[0].offsetWidth >= $window.innerWidth) {
            x = $window.innerWidth - parent[0].offsetWidth;
          }
          if (y <= 0) {
            y = 0;
          } else if (y + parent[0].offsetHeight >= $window.innerHeight - 50){
            y = $window.innerHeight - parent[0].offsetHeight -50;
          }
          parent[0].setAttribute("data-left", x);
          parent[0].setAttribute("data-top", y);
          parent.css({
            top: y + 'px',
            left:  x + 'px'
          });
      }
      function mouseup() {
          $document.unbind('mousemove', mousemove);
          $document.unbind('mouseup', mouseup);
        }
    }
  });
