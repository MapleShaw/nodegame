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
	        element.bind("keydown keypress", function(event) {
	            if (event.which === 13) {
	                scope.$apply(function() {
	                    scope.$eval(attrs.onEnter);
	                });
	                event.preventDefault();
	            }
	        });
	    };
	}).
	//window drag
	directive('onDraggable', function($document) {
    var startX = 0,
    	startY = 0;
    return function(scope, element, attr) {
    	var parent = element.parent("chatDialog");
    	var x = parent[0].getAttribute("data-left");//parseInt(parent[0].style.left);
    	var y = parent[0].getAttribute("data-top");//parseInt(parent[0].style.top);
    	console.log(x,y);
    	
    	element.bind('mousedown', function(event) {
	        startX = event.screenX - x;
	        startY = event.screenY - y;
	        $document.bind('mousemove', mousemove);
	        $document.bind('mouseup', mouseup);
	    });
 		
    	function mousemove(event) {
	        y = event.screenY - startY;
	        x = event.screenX - startX;
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
