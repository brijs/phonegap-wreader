'use strict';

/* Directives */


var directives = angular.module('wReader.directives', []);


directives.directive('wContent', function() {
	return {
		restrict: 'E',
		// src = src html for this iframe (embedded html page)
		template: '<iframe height="200%" id="postIframe" height="200%" frameborder="0" width="100%" src="post-content.html" seamless  class="post-content"></iframe>',
		link: function($scope, $element, attrs) {
			var iframeWindow = $element.find('iframe')[0].contentWindow;

			$scope.$watch(attrs.src, function(content) {
				// https://developer.mozilla.org/en-US/docs/DOM/window.postMessage
				// send a message to the other window(ie the iframe window)
				// 2nd arg is the targetOrigin ('*' means don't care)
				// => this event is captured by iframe using window.addEventListener(.)
				iframeWindow.postMessage({
					type: 'loadContent',
					content: content // new items.selected.content
				}, '*');

			});


			// the embedded iframe bubbles up the click events;
			// capture it and dispatch it again at the parent window
			window.addEventListener('message', function(event) {
				if (event.data.type !== 'openUrl') {
					return;
				}

				// create a <a> element & then simulate a click below
				var linkElem = angular.element('<a href="' + event.data.url + '" target="_blank"></a>"')[0],
					myClickEvent = document.createEvent('MouseEvents');
			
				// https://developer.mozilla.org/en-US/docs/DOM/document.createEvent		
				// simulate a mouseclick event in the parent window
				// 'MouseEvents' is a pre-defined event type
				myClickEvent.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, linkElem);
				linkElem.dispatchEvent(myClickEvent);
			});


		}
	};
});


directives.directive('wKeydown', function() {
	return function(scope, elm, attr) {
		elm.bind('keydown', function(e) {
			switch(e.keyCode) {
				case 34: // PgDn
				case 39: // right arrow
				case 40: // down arrow
				case 74: // j
					return scope.$apply(attr.wDown);

				case 32: // Space
					e.preventDefault();
					return scope.$apply(attr.wSpace);

				case 33: // PgUp
				case 37: // left arrow
				case 38: // up arrow
				case 75: // k
					return scope.$apply(attr.wUp);

				case 85: // U
					return scope.$apply(attr.wRead);

				case 72: // H
					return scope.$apply(attr.wStar);
			}
		});
	};
});