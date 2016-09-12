'use strict';

angular.module('baristaMatic')
  .directive('coffeeMenu', coffeeMenu)
  .controller('CoffeeMenuCtrl', CoffeeMenuCtrl);

/**
 * @ngdoc directive
 * @name coffeeMenu
 * @module baristaMatic
 * @description
 * View for coffee menu, includes list of menu items and order status
 */
function coffeeMenu() {
  return {
    restrict: 'E',
    templateUrl: 'app/js/coffeeMenu.html',
    controller: 'CoffeeMenuCtrl',
    controllerAs: 'vm',
    scope: {}
  };
}

/**
 * @ngdoc controller
 * @name CoffeeMenuCtrl
 * @module baristaMatic
 * @requires $rootScope
 * @requires $scope
 * @requires $timeout
 * @requires inventoryService
 * @description
 * Controller for <coffee-menu> directive
 */
CoffeeMenuCtrl.$inject = ['$rootScope', '$scope', '$timeout', 'inventoryService'];
function CoffeeMenuCtrl($rootScope, $scope, $timeout, inventoryService) {
  var vm = this;

  vm.orderStatus = '';

  vm.orderDrink = _orderDrink;

  _activate();

  function _activate() {
    _getMenu();

    // $scope listener for when an menu item has been ordered, so pantry can be updated with latest quantities
    $scope.$on('pantry:updated', _getMenu);
  }

  function _getMenu() {
    vm.menuItems = inventoryService.getMenuItems();
  }

  /**
   * @ngdoc method
   * @name CoffeeMenuCtrl#orderDrink
   * @param {Object} item The selected menu item, includes:
   *    menuLabel {String} - The label for the menu item
   *    isAvailable {Boolean} - Whether the menu item is available for ordering
   *    formattedPrice {String} - The price of the menu item
   * @description
   * When selecting a menu item, update the order status and update the menu (based on ingredient availability)
   */
  function _orderDrink(item) {
    if (angular.isNumber(item)) {
      // if item is a number, then this item is from the input text box and not from selecting one of the menu buttons
      item = vm.menuItems[item - 1];
    } else if (angular.isObject(item)){
      // when ordering from button click, ensure input textbox matches selection
      vm.selectedMenuItem = vm.menuItems.indexOf(item) + 1;
    }

    if (item.isAvailable) {
      _finishOrder(item);
    } else {
      vm.orderStatus = 'Out of stock: ' + item.menuLabel;
    }
  }

  function _finishOrder(item) {
    // show order status
    vm.orderStatus = 'Dispensing: ' + item.menuLabel;

    // simulate a delay in order status for demo purposes so that we can visualize label changes
    $timeout(function() {
      vm.orderStatus = '';
      vm.selectedMenuItem = null;

      // let other components know that order has been completed
      $rootScope.$broadcast('menuItem:ordered', { orderedItem: item });

      // update menu based on ingredient availability in the pantry
      vm.menuItems = inventoryService.getMenuItems();
    }, 1000);
  }
}
