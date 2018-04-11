(function () {
  'use strict';

  angular
    .module('viewers.admin')
    .controller('ViewersAdminController', ViewersAdminController);

  ViewersAdminController.$inject = ['$scope', '$state', '$window', 'viewerResolve', 'Authentication', 'Notification'];

  function ViewersAdminController($scope, $state, $window, viewer, Authentication, Notification) {
    var vm = this;

    vm.viewer = viewer;
    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Viewer
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.viewer.$remove(function () {
          $state.go('admin.viewers.list');
          Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Viewer deleted successfully!' });
        });
      }
    }

    // Save Viewer
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.viewerForm');
        return false;
      }

      // Create a new viewer, or update the current instance
      vm.viewer.createOrUpdate()
        .then(successCallback)
        .catch(errorCallback);

      function successCallback(res) {
        $state.go('admin.viewers.list'); // should we send the User to the list or the updated Viewer's view?
        Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Viewer saved successfully!' });
      }

      function errorCallback(res) {
        Notification.error({ message: res.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Viewer save error!' });
      }
    }
  }
}());
