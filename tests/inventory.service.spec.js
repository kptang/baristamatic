'use strict'

describe('inventoryService', function() {
  var inventoryService,
      pantryItems,
      menu;

  beforeEach(module('baristaMatic'));

  beforeEach(inject(function(_inventoryService_) {
    inventoryService = _inventoryService_;
  }));

  describe('initialization', function() {
    beforeEach(function() {
      pantryItems = inventoryService.getPantryItems();
    });

    it('sets up pantry items', function() {
      expect(pantryItems.length).toBe(9);
    });

    it('sorts pantry items', function() {
      var isSorted = false,
          sortedPantryIngredients = _.pluck(pantryItems, 'name').sort();

      isSorted = _.every(pantryItems, function(pantryItem, index) {
        return pantryItem.name === sortedPantryIngredients[index];
      });

      expect(isSorted).toBe(true);
    });

    it('restocks all pantry items', function() {
      var allItemsHave10units = false;

      allItemsHave10units = _.every(pantryItems, function(pantryItem) {
        return pantryItem.quantity === 10;
      });

      expect(allItemsHave10units).toBe(true);
    });

    it('sets up ingredient price list', function() {
      expect(inventoryService.getIngredientPrices().length).toBe(9);
    });
  });

  describe('when getting menu', function() {
    describe('when patry is fully stocked', function() {
      beforeEach(function() {
        menu = inventoryService.getMenuItems();
      });

      it('sets all items to be available', function() {
        var allItemsAvailable = _.every(menu, function(menuItem) {
          return menuItem.isAvailable;
        });

        expect(allItemsAvailable).toBe(true);
      });

      it('sorts menu items', function() {
        var isSorted = false,
            sortedMenuItems = _.pluck(pantryItems, 'menuLabel').sort();

        isSorted = _.every(menu, function(menuItem, index) {
          return menuItem.name === sortedMenuItems[index];
        });

        expect(isSorted).toBe(true);
      });
    });

    describe('when pantry is not fully stocked', function() {
      beforeEach(function() {
        // remove ingredients for coffee 3x will ensure that there are not enough ingredients for a 4th coffee
        inventoryService.removeIngredientsFromPantry('coffee');
        inventoryService.removeIngredientsFromPantry('coffee');
        inventoryService.removeIngredientsFromPantry('coffee');

        menu = inventoryService.getMenuItems();
      });

      afterEach(function() {
        inventoryService.restockPantry();
      });

      it('sets coffee to be unavailable', function() {
        var coffee = _.findWhere(menu, { menuLabel: 'coffee' });

        expect(coffee.isAvailable).toBe(false);
      });

      it('sets all non-coffee items to be available', function() {
        var availableItems = _.where(menu, { isAvailable: true });

        expect(availableItems.length).toBe(5);
      });
    });
  });
});
