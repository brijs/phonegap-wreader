'use strict';

/* Services */


var services = angular.module('wReader.services', ['ng']);

// Item Class - represents one entry in a feed
function Item(entry, feedTitle, feedUrl) {
	this.read = false;
	this.starred = false;
	this.selected = false;
	this.feedTitle = feedTitle;
	this.feedUrl = feedUrl;

	angular.extend(this, entry);
}

Item.prototype.$$hashKey = function() {
	return this.id;
};


// "ViewModel" service representing all feed entries & their states in the UI
services.factory('Items', ['$http', 'FeedStoreSvc', function(http, feedStoreSvc) {

	// this object(ie {}) represents the UI & various UI states
	var items = {
		// data & states
		all: [],
		filtered: [],
		selected: null,
		selectedIdx: null,
		readCount: 0,
		starredCount: 0,

		// methods
		getItemsFromDataStore: function() {
			items.clearItems();
			feedStoreSvc.getAll().then(function(feed) {
				angular.forEach(feed.entries, function(entry){
					var item = new Item(entry, feed.title, feed.url);
					items.all.push(item);
				});
			
				console.log("Entries loaded from data store");

				items.all.sort(function(A,B) {
					return new Date(B.date).getTime() - new Date(A.date).getTime();
				});

				items.filtered = items.all;
				items.readCount = items.all.reduce(function(count, item) {
					return item.read ? count+=1: count; }, 0);
				items.starredCount = items.all.reduce(function(count, item) {
					return item.starred ? count+=1: count; }, 0);
				items.selected = items.selected ?
				items.all.filter(function(item) {return item.id === items.selected.id;})[0]
				: null;
				items.reindexSelectedItem();
			});
		},

		prev: function() {
			if (items.hasPrev()) {
				items.selectItem(items.selected ? items.selectedIdx-1: 0);
			}
		},

		next: function() {
			if (items.hasNext()) {
				items.selectItem(items.selected ? items.selectedIdx+1:0);
			}
		},

		hasPrev: function() {
			if (!items.selected) { return true; }
			return items.selectedIdx > 0;
		},

		hasNext: function() {
			if (!items.selected) { return true; }
			return items.selectedIdx < items.filtered.length - 1;
		},

		selectItem: function(idx) {
			if (items.selected) {
				items.selected.selected = false;
			}

			items.selected = items.filtered[idx];
			items.selectedIdx = idx;
			items.selected.selected = true;

			if (!items.selected.read) { items.toggleRead(); }
		},

		toggleRead: function() {
			var item = items.selected,
			read = !item.read;

			item.read = read;
			//feedStoreSvc.updateEntryProp(.)
			items.readCount += read ? 1: -1;
		},

		toggleStarred: function() {
			var item = items.selected,
			starred = !item.starred;

			item.starred = starred;
			// feedStoreSvc.updateEntryProp(.)
			items.starredCount += starred ? 1: -1;
		},

		markAllRead: function() {
			items.filtered.forEach(function(item) {
				item.read = true;
				// feedStoreSvc.updateEntryProp(.)
			});
			items.readCount = items.filtered.length;
		},

		filterBy: function(key,value) {
			items.filtered = items.all.filter(function(item) {
				return item[key] === value;
			});
			items.reindexSelectedItem();
		},

		clearFilter: function() {
			items.filtered = items.all;
			items.reindexSelectedItem();
		},

		clearItems: function() {
			items.all = [];
			items.filtered = [];
			items.selected = null;
			items.selectedIdx = null;
			items.readCount = 0;
			items.starredCount = 0;
		},

		reindexSelectedItem: function() {
			if (items.selected) {
				var idx = items.filtered.indexOf(items.selected);

				if (idx === -1) {
					if (items.selected) {items.selected.selected = false;}

					items.selected = null;
					items.selectedIdx = null;
				} else {
					items.selectedIdx = idx;
					items.selected.selected = true;
				}
			}
		}
	}; // items { } end

	items.getItemsFromDataStore();
	return items;
}]);


// FeedStoreSvc
// 
services.factory('FeedStoreSvc', ['FeedSvc', function(feedSvc) {
	return {
		privateVal: 10,
		updateFeed: function(feed) {
			// update local store
			return feed;
		},
		getFeed: function() {
			// if not in localstore, do
			// FeedSvc.refreshFeed().then(function() {
			//  update local store
			//})
			return null;
		},

		getAll: function() {
			// todos: for now, fetch feed;todo: read from local store
			var FEED_URL = 'http://blog.chromium.org/feeds/posts/default?alt=json&callback=JSON_CALLBACK';
			return feedSvc.fetchFeed(FEED_URL);
		}
	};
}]);


// FeedSvc(feedUrl) service
//   - fetchFeed()
//   - refreshFeed()
services.factory('FeedSvc', ['$http', function(http) {

	// helper function
	function getLink(links, rel) {
		var i;
		for (i = 0; i < links.length; i+=1) {
			if (links[i].rel === rel) {
				return links[i].href;
			}
		}
		return null;
	}


	// return the 'service object'
	return {
		someVal: 4, 
		fetchFeed: function(feedUrl) {
			// $http.get() returns a promise which is resolved
			// when the http response is received
			return http.jsonp(feedUrl).then(function (response) {
				var feed = {
					title: response.data.feed.title.$t,
					//url: getLink(response.data.feed.link, 'alternate'),
					entries: {}
				};
				//dump(response);
				response.data.feed.entry.forEach(function (entry) {
					// dump(entry);
					feed.entries[entry.id.$t] = {
						id: entry.id.$t,
						title: entry.title.$t,
						content: entry.content.$t,
						author: entry.author[0].name.$t,
						url: getLink(entry.link, 'alternate'),
						date: entry.published.$t,
						read: false,
						starred: false
					};
				});
				return feed;
			});
		}, 

		// fetch feed and update feedStore
		refreshFeed: function(feedUrl) {
			// note that refreshFeed returns a promise (returned by then)
			return this.fetchFeed(feedUrl).then(function (feed) {
				return feed;
				//return feedStoreSvc.updateFeed(feed);
			});
		}
	};
}]);

services.value('scroll', {
	pageDown: function() {
		var itemHeight = $('.entry.active').height() + 60;
	  var winHeight = $(window).height();
	  var curScroll = $('.entries').scrollTop();
	  var scroll = curScroll + winHeight;

	  if (scroll < itemHeight) {
	  	$('.entries').scrollTop(scroll);
	  	return true;
	  }

	  // already at the bottom
	  return false;
	},

	toCurrent: function() {
		// Need the setTimeout to prevent race condition with item being selected.
		window.setTimeout(function() {
      var curScrollPos = $('.summaries').scrollTop();
      var itemTop = $('.summary.active').offset().top - 60;
      $('.summaries').animate({'scrollTop': curScrollPos + itemTop}, 200);
    }, 0);
	}
});



