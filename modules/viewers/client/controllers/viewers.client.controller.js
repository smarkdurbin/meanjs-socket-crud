(function () {
  'use strict';

  angular
    .module('viewers')
    .controller('ViewersController', ViewersController);

  ViewersController.$inject = ['$scope', 'viewerResolve', 'Authentication'];

  function ViewersController($scope, viewer, Authentication) {
    var vm = this;

    vm.viewer = viewer;
    vm.authentication = Authentication;

  }
}());
