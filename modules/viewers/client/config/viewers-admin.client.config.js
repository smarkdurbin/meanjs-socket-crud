(function () {
  'use strict';

  // Configuring the Viewers Admin module
  angular
    .module('viewers.admin')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(Menus) {
    Menus.addSubMenuItem('topbar', 'admin', {
      title: 'Manage Viewers',
      state: 'admin.viewers.list'
    });
  }
}());
