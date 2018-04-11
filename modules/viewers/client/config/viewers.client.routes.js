(function () {
  'use strict';

  angular
    .module('viewers.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('viewers', {
        abstract: true,
        url: '/viewers',
        template: '<ui-view/>'
      })
      .state('viewers.list', {
        url: '',
        templateUrl: '/modules/viewers/client/views/list-viewers.client.view.html',
        controller: 'ViewersListController',
        controllerAs: 'vm'
      })
      .state('viewers.view', {
        url: '/:viewerId',
        templateUrl: '/modules/viewers/client/views/view-viewer.client.view.html',
        controller: 'ViewersController',
        controllerAs: 'vm',
        resolve: {
          viewerResolve: getViewer
        },
        data: {
          pageTitle: '{{ viewerResolve.title }}'
        }
      });
  }

  getViewer.$inject = ['$stateParams', 'ViewersService'];

  function getViewer($stateParams, ViewersService) {
    return ViewersService.get({
      viewerId: $stateParams.viewerId
    }).$promise;
  }
}());
