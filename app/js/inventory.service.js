'use strict';

angular.module('baristaMatic')
  .factory('inventoryService', inventoryService);

/**
 * @ngdoc service
 * @name inventoryService
 * @module baristaMatic
 * @requires $filter
 * @description
 * Factory function for doing pantry-related operations
 */
inventoryService.$inject = ['$filter'];
function inventoryService($filter) {
  var _pantry = {},
      _priceMap = {};

  var _recipes = [{
      menuItem: 'coffee',
      image: 'images/coffee.png',
      ingredients: [{
        name: 'coffee',
        key: 1,
        quantity: 3
      }, {
        name: 'sugar',
        key: 2,
        quantity: 1
      }, {
        name: 'cream',
        key: 3,
        quantity: 1
      }]
    }, {
      menuItem: 'decaf coffee',
      image: 'images/coffee.png',
      ingredients: [{
        name: 'decaf coffee',
        key: 4,
        quantity: 3
      }, {
        name: 'sugar',
        key: 2,
        quantity: 1
      }, {
        name: 'cream',
        key: 3,
        quantity: 1
      }]
    }, {
      menuItem: 'caffe latte',
      image: 'images/latte.png',
      ingredients: [{
        name: 'espresso',
        key: 7,
        quantity: 2
      }, {
        name: 'steamed milk',
        key: 5,
        quantity: 1
      }]
    }, {
      menuItem: 'caffe americano',
      image: 'images/americano.png',
      ingredients: [{
        name: 'espresso',
        key: 7,
        quantity: 3
      }]
    }, {
      menuItem: 'caffe mocha',
      image: 'images/mocha.png',
      ingredients: [{
        name: 'espresso',
        key: 7,
        quantity: 1
      }, {
        name: 'cocoa',
        key: 8,
        quantity: 1
      }, {
        name: 'steamed milk',
        key: 5,
        quantity: 1
      }, {
        name: 'whipped cream',
        key: 9,
        quantity: 1
      }]
    }, {
      menuItem: 'cappuccino',
      image: 'images/cappuccino.png',
      ingredients: [{
        name: 'espresso',
        key: 7,
        quantity: 2
      }, {
        name: 'steamed milk',
        key: 5,
        quantity: 1
      }, {
        name: 'foamed milk',
        key: 6,
        quantity: 1
      }]
    }];

  var _ingredientPrices = [{
      name: 'coffee',
      key: 1,
      price: 0.75
    }, {
      name: 'decaf coffee',
      key: 2,
      price: 0.75
    }, {
      name: 'sugar',
      key: 3,
      price: 0.25
    }, {
      name: 'cream',
      key: 4,
      price: 0.25
    }, {
      name: 'steamed milk',
      key: 5,
      price: 0.35
    }, {
      name: 'foamed milk',
      key: 6,
      price: 0.35
    }, {
      name: 'espresso',
      key: 7,
      price: 1.10
    }, {
      name: 'cocoa',
      key: 8,
      price: 0.90
    }, {
      name: 'whipped cream',
      key: 9,
      price: 1
    }];

  _activate();

  function _activate() {
    _buildPantry();
    _restockPantry();

    _buildPriceMap();
  }

  return {
    getIngredientPrices: _getIngredientPrices,
    getMenuItems: _getMenuItems,
    getPantryItems: _getPantryItems,
    removeIngredientsFromPantry: _removeIngredientsFromPantry,
    restockPantry: _restockPantry
  };

  // build pantry hashmap as Object<String, Object>
  // where key = ingredient name, value = ingredient object (container quantity (Number) property)
  function _buildPantry() {
    angular.forEach(_ingredientPrices, function(ingredient) {
      _pantry[ingredient.name] = {};
    });
  }

  // build price hashmap as Object<String, Number> where key = ingredient name, value = price
  // hashmap provides faster lookup of prices than searching through array each item we need to compute prices
  function _buildPriceMap() {
    angular.forEach(_ingredientPrices, function(ingredient) {
      _priceMap[ingredient.name] = ingredient.price;
    });
  }

  /**
   * @ngdoc method
   * @name inventoryService#getIngredientPrices
   * @return {Object[]} Array of ingredient prices, where each item contains:
   *    name {String} - name of the ingredient
   *    price {Number} - price of the ingredient
   */
  function _getIngredientPrices() {
    return _ingredientPrices;
  }

  /**
   * @ngdoc method
   * @name inventoryService#getMenuItems
   * @return {Object[]} Array of menu items, sorted by menu label. Each item contains:
   *    menuLabel {String} - lowercase label as it should appear on the menu
   *    imageUrl {String} - url for menu item
   *    isAvailable {Boolean} - whether the item is available, based on whether pantry has all ingredients in stock
   *    formattedString {String} - price of the menu item, formatted as a currency string
   */
  function _getMenuItems() {
    var detailedMenu = [],
        menuItems = [ 'coffee', 'decaf coffee', 'caffe latte', 'caffe americano', 'caffe mocha', 'cappuccino' ];

    menuItems.sort();
    angular.forEach(menuItems, function(menuItem) {
      var recipe = _getRecipe(menuItem);
      detailedMenu.push({
        menuLabel: menuItem,
        imageUrl: recipe.image,
        isAvailable: _hasIngredientsInStock(recipe),
        formattedPrice: _getPriceAsString(recipe)
      });
    });

    return detailedMenu;
  }

  /**
   * @ngdoc method
   * @name inventoryService#getPantryItems
   * @return {Object[]} Array of pantry items, sorted by ingredient name. Each item contains:
   *    name {String} - name of the ingredient
   *    quantity {Number} - units of ingredient remaining
   */
  function _getPantryItems() {
    var pantryArray = [], pantryKeys = [];

    angular.forEach(_pantry, function(quantity, ingredient) {
      pantryKeys.push(ingredient);
    });

    pantryKeys.sort();

    angular.forEach(pantryKeys, function(pantryKey) {
      pantryArray.push({
        name: pantryKey,
        quantity: _pantry[pantryKey].quantity
      });
    });

    return pantryArray;
  }

  // given a recipe, compute the cost based on the quantity of the ingredients used
  // returns a currency-formatted string
  function _getPriceAsString(recipe) {
    var price = 0;

    angular.forEach(recipe.ingredients, function(ingredient) {
      price += _priceMap[ingredient.name] * ingredient.quantity;
    });

    // return formatted price as a number and as a currency string
    price = price.toFixed(2);
    return $filter('currency')(price, '$', 2);
  }

  // look up the recipe in the list of recipes
  function _getRecipe(menuItem) {
    var recipe = [];

    for (var i = 0; i < _recipes.length; i++) {
      if (_recipes[i].menuItem.toLowerCase() === menuItem) {
        recipe = _recipes[i];
        break;
      }
    }

    return recipe;
  }

  // return true if the pantry has all the ingredients in the given recipe in stock; otherwise, return false
  function _hasIngredientsInStock(recipe) {
    var hasIngredientsInStock = true;

    for (var i = 0; i < recipe.ingredients.length; i++) {
      var ingredient = recipe.ingredients[i],
          pantryItem = _pantry[ingredient.name];

      if (pantryItem.quantity < ingredient.quantity) {
        hasIngredientsInStock = false;
        break;
      }
    }
    return hasIngredientsInStock;
  }

  /**
   * @ngdoc method
   * @name inventoryService#removeIngredientsFromPantry
   * @param {String} menuItem Name of the menu item whose ingredients will be removed from the pantry
   * @description
   * Looks up the recipe for the given menu item and removes the corresponding ingredients from the pantry for making
   * a single order of the menu item
   */
  function _removeIngredientsFromPantry(menuItem) {
    var recipe = _getRecipe(menuItem);

    angular.forEach(recipe.ingredients, function(ingredient) {
      var pantryItem = _pantry[ingredient.name];
      pantryItem.quantity -= ingredient.quantity;
    });
  }

  /**
   * @ngdoc method
   * @name inventoryService#restockPantry
   * @description
   * Updates the pantry object so that each pantry item has 10 units
   */
  function _restockPantry() {
    angular.forEach(_pantry, function(pantryItem) {
      pantryItem.quantity = 10;
    });
  }
}
