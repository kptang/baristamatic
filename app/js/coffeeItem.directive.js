'use strict';

angular.module('baristaMatic')
  .directive('coffeeItem', coffeeItem);

/**
 * @ngdoc directive
 * @name coffeeItem
 * @module baristaMatic
 * @description
 * View for coffee item button on the menu, includes drink name, drink price, and whether drink is in stock
 */
function coffeeItem() {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      coffee: '=',
      onClick: '&'
    },
    templateUrl: 'app/js/coffeeItem.html',
    link: function(scope, element, attrs) {
      var elementWidth = element[0].offsetWidth;
      element.css('height', elementWidth + 'px');
    }
  };
}
