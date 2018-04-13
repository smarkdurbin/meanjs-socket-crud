(function() {
    'use strict';

    angular
        .module('viewers.admin')
        .controller('ViewersAdminListController', ViewersAdminListController);

    ViewersAdminListController.$inject = ['ViewersService', '$scope', '$filter', 'Socket', 'Notification'];

    function ViewersAdminListController(ViewersService, $scope, $filter, Socket, Notification) {
        var vm = this;

        vm.buildPager = buildPager;
        vm.figureOutItemsToDisplay = figureOutItemsToDisplay;
        vm.pageChanged = pageChanged;

        ViewersService.query(function(data) {
            vm.viewers = data;
            vm.buildPager();
        });

        function buildPager() {
            vm.pagedItems = [];
            // vm.itemsPerPage = 10;
            $scope.itemsPerPage = 10;
            vm.itemsPerPage = $scope.itemsPerPage;
            vm.currentPage = 1;
            vm.figureOutItemsToDisplay();
        }

        function figureOutItemsToDisplay() {
            vm.itemsPerPage = $scope.itemsPerPage;
            vm.filteredItems = $filter('filter')(vm.viewers, {
                $: vm.search
            });
            vm.filterLength = vm.filteredItems.length;
            var begin = ((vm.currentPage - 1) * vm.itemsPerPage);
            var end = begin + vm.itemsPerPage;
            vm.pagedItems = vm.filteredItems.slice(begin, end);
        }

        function pageChanged() {
            vm.figureOutItemsToDisplay();
        }

        Socket.on('viewer.created', function(viewer) {
            $scope.$apply(function() {
                vm.viewers.unshift(viewer);
                Notification.info({ message: '<i class="fas fa-check"></i>&nbsp; New viewer <strong>' + viewer.viewer_name + '</strong> added!' });
            });
            vm.pageChanged();
        });
        
        Socket.on('viewer.updated', function(viewer) {
            $scope.$apply(function() {
                for(var i = $scope.vm.viewers.length - 1; i >= 0; i--){
                    if($scope.vm.viewers[i]._id == viewer._id){
                        $scope.vm.viewers.splice(i,1, viewer);
                        Notification.warning({ message: '<i class="fas fa-exclamation-triangle"></i>&nbsp; Viewer <strong>' + vm.viewers[i].viewer_name + '</strong> has been updated!' });
                    }
                }
            });
            vm.pageChanged();
        });
        
        Socket.on('viewer.deleted', function(viewer) {
            $scope.$apply(function() {
                for(var i = $scope.vm.viewers.length - 1; i >= 0; i--){
                    if($scope.vm.viewers[i]._id == viewer._id){
                        $scope.vm.viewers.splice(i,1);
                        Notification.warning({ message: '<i class="fas fa-exclamation-triangle"></i>&nbsp; Viewer <strong>' + viewer.viewer_name + '</strong> has been deleted!' });
                    }
                }
            });
            vm.pageChanged();
        });
        
    }
}());