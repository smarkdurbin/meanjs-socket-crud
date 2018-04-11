(function() {
  'use strict';

  angular
    .module('articles')
    .controller('ArticlesListController', ArticlesListController);

  ArticlesListController.$inject = ['ArticlesService', '$scope', 'Socket'];

  function ArticlesListController(ArticlesService, $scope, Socket) {
    var vm = this;

    vm.articles = ArticlesService.query();

    Socket.on('article.created', function(article) {
      $scope.$apply(function(){
            vm.articles.push(article);             
        });
      console.log(article);
    });
  }
}());
