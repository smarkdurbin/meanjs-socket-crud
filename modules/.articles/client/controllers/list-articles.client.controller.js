(function() {
    'use strict';

    angular
        .module('articles')
        .controller('ArticlesListController', ArticlesListController);

    ArticlesListController.$inject = ['ArticlesService', '$scope', 'Socket', 'Notification'];

    function ArticlesListController(ArticlesService, $scope, Socket, Notification) {
        var vm = this;

        vm.articles = ArticlesService.query();

        Socket.on('article.created', function(article) {
            $scope.$apply(function() {
                vm.articles.unshift(article);
                Notification.info({ message: '<i class="glyphicon glyphicon-ok"></i> New article <strong>'+article.title+'</strong> added!' });
            });
        });
    }
}());
