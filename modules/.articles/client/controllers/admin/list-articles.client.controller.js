(function () {
  'use strict';

  angular
    .module('articles.admin')
    .controller('ArticlesAdminListController', ArticlesAdminListController);

  ArticlesAdminListController.$inject = ['ArticlesService', 'Socket'];

  function ArticlesAdminListController(ArticlesService, Socket) {
    var vm = this;

    vm.articles = ArticlesService.query();
    
    Socket.on('connection', function() {
        console.log('connected');
    });
    
  }
}());
