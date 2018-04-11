(function () {
  'use strict';

  angular
    .module('viewers.admin.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin.viewers', {
        abstract: true,
        url: '/viewers',
        template: '<ui-view/>'
      })
      .state('admin.viewers.list', {
        url: '',
        templateUrl: '/modules/viewers/client/views/admin/list-viewers.client.view.html',
        controller: 'ViewersAdminListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        }
      })
      .state('admin.viewers.create', {
        url: '/create',
        templateUrl: '/modules/viewers/client/views/admin/form-viewer.client.view.html',
        controller: 'ViewersAdminController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          viewerResolve: newViewer
        }
      })
      .state('admin.viewers.edit', {
        url: '/:viewerId/edit',
        templateUrl: '/modules/viewers/client/views/admin/form-viewer.client.view.html',
        controller: 'ViewersAdminController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ viewerResolve.title }}'
        },
        resolve: {
          viewerResolve: getViewer
        }
      });
  }

  getViewer.$inject = ['$stateParams', 'ViewersService'];

  function getViewer($stateParams, ViewersService) {
    return ViewersService.get({
      viewerId: $stateParams.viewerId
    }).$promise;
  }

  newViewer.$inject = ['ViewersService'];

  function newViewer(ViewersService) {
    return new ViewersService();
  }
}());
