'use strict';

angular.module('baristaMatic')
  .directive('pantry', pantry)
  .controller('PantryCtrl', PantryCtrl);

/**
 * @ngdoc directive
 * @name pantry
 * @module baristaMatic
 * @description
 * View for pantry, includes list of ingredients and their quantities\
 */
function pantry() {
  return {
    restrict: 'E',
    scope: {},
    templateUrl: 'app/js/pantry.html',
    controller: 'PantryCtrl',
    controllerAs: 'vm'
  };
}

/**
 * @ngdoc controller
 * @name PantryCtrl
 * @module baristaMatic
 * @requires $rootScope
 * @requires $scope
 * @requires inventoryService
 * @description
 * Controller for <pantry> directive
 */
PantryCtrl.$inject = ['$rootScope', '$scope', 'inventoryService'];
function PantryCtrl($rootScope, $scope, inventoryService) {
  var vm = this;

  vm.restock = _restock;

  _activate();

  function _activate() {
    _updatePantry();

    // $scope listener for when an menu item has been ordered, so pantry can be updated with latest quantities
    $scope.$on('menuItem:ordered', _updatePantry);
  }

  /**
   * @ngdoc method
   * @name PantryCtrl#restock
   * @description
   * Update pantry so that all ingredients have 10 units
   */
  function _restock() {
    inventoryService.restockPantry();
    _updatePantry();

    $rootScope.$broadcast('pantry:updated');
  }

  // updates pantry; if called from $scope listener, then removes ingredients from pantry before updating pantry
  function _updatePantry(event, data) {
    if (data) {
      inventoryService.removeIngredientsFromPantry(data.orderedItem.menuLabel);
    }

    vm.pantry = inventoryService.getPantryItems();
  }
}
