(function () {
  'use strict';

  angular
    .module('viewers.admin')
    .controller('ViewersAdminListController', ViewersAdminListController);

  ViewersAdminListController.$inject = ['ViewersService'];

  function ViewersAdminListController(ViewersService) {
    var vm = this;

    vm.viewers = ViewersService.query();
  }
}());
