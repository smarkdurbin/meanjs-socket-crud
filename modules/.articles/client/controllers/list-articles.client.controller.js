(function () {
  'use strict';

  angular
    .module('articles')
    .controller('ArticlesListController', ArticlesListController);

  ArticlesListController.$inject = ['ArticlesService', 'Authentication', 'Socket'];

  function ArticlesListController(ArticlesService, Authentication, Socket) {
    var vm = this;
    
    // Make sure the Socket is connected
      if (!Socket.socket) {
        Socket.connect();
      }

      // Add an event listener to the 'chatMessage' event
      Socket.on('chatMessager', function (message) {
        console.log(message);
      });

    vm.articles = ArticlesService.query();
  }
}());
