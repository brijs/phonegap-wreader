'use strict';

/* Controllers */
// Am declaring controllers as top level functions.
function AppController($scope, items, scroll) {

	// expose Items service in the scope, so that all of its
	// methods can be called directly from the view (index.html)
	// Note that Items is a 'ViewModel' service implementation
	$scope.items = items; 

	$scope.refresh = function() {
		items.getItemsFromDataStore();
	};

	//$scope.hadnleSpace

	$scope.$watch('items.selectedIdx', function(newVal) {
		if (newVal !== null) {
			scroll.toCurrent();
		}
	});

}

AppController.$inject = ['$scope', 'Items', 'scroll'];

function NavBarController($scope, items) {
	$scope.showAll = function() {
		items.clearFilter();
	};

	$scope.showUnread = function() {
		items.filterBy('read', false);
	};

	$scope.showStarred = function() {
		items.filterBy('starred', true);
	};

	$scope.showRead = function() {
		items.filterBy('read', true);
	};
}

NavBarController.$inject = ['$scope', 'Items'];

