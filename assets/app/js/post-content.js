'use strict';

window.addEventListener('message', function(event) {

	// should check for the following (see targetOrigin)
	// event.origin !=== "myhostname:portNum" return;

	// 'loadContent' is our custom event sent from directive wContent
	if (event.data.type !== 'loadContent') {
		return;
	}

	// this script is dealing with the iframe document & since
	// our string data is HTML, we directly set the innerHTML
	document.body.innerHTML = event.data.content;
	//recalcHeight();

	// we have to intercept all link clicks in the sandboxed iframe and send a message to the main app context to open
	// the link
	function getAllLinks() {
		return [].splice.call(document.querySelectorAll('a[href]'), 0);
	}

	getAllLinks().forEach(function(node) {
		node.addEventListener('click', function(e) {
			e.preventDefault();
			window.parent.postMessage({type: 'openUrl', url: node.href}, '*');
		}, false);
	});

	
}, false);

function recalcHeight() {
	var thisIframe = document.getElementById('postIframe');
	console.log(thisIframe);console.log(thisIframe.height);
	console.log(thisIframe.contentWindow.document.body.scrollHeight);
	thisIframe.height = thisIframe.contentWindow.document.body.scrollHeight + "px";
}

