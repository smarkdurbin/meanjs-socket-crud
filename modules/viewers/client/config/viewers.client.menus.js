(function () {
  'use strict';

  angular
    .module('viewers')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      title: 'Viewers',
      state: 'viewers',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'viewers', {
      title: 'List Viewers',
      state: 'viewers.list',
      roles: ['*']
    });
  }
}());
