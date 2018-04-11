(function() {
    'use strict';

    angular
        .module('viewers')
        .controller('ViewersListController', ViewersListController);

    ViewersListController.$inject = ['ViewersService', '$scope', 'Socket', 'Notification'];

    function ViewersListController(ViewersService, $scope, Socket, Notification) {
        var vm = this;

        vm.viewers = ViewersService.query();

        Socket.on('viewer.created', function(viewer) {
            $scope.$apply(function() {
                vm.viewers.unshift(viewer);
                Notification.info({ message: '<i class="glyphicon glyphicon-ok"></i> New viewer <strong>'+viewer.title+'</strong> added!' });
            });
        });
    }
}());
