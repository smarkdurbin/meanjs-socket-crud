(function() {
    'use strict';

    angular
        .module('viewers')
        .controller('ViewersListController', ViewersListController);

    ViewersListController.$inject = ['ViewersService', '$scope', '$filter', 'Socket', 'Notification'];

    function ViewersListController(ViewersService, $scope, $filter, Socket, Notification) {
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
                Notification.info({ message: '<i class="glyphicon glyphicon-ok"></i> New viewer <strong>' + viewer.title + '</strong> added!' });
            });
        });
    }
}());
