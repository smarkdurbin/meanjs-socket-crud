(function() {
    'use strict';

    angular
        .module('viewers.services')
        .factory('ViewersService', ViewersService);

    ViewersService.$inject = ['$resource', '$log'];

    function ViewersService($resource, $log) {
        var Viewer = $resource('/api/viewers/:viewerId', {
            viewerId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });

        angular.extend(Viewer.prototype, {
            createOrUpdate: function() {
                var viewer = this;
                return createOrUpdate(viewer);
            }
        });

        return Viewer;

        function createOrUpdate(viewer) {
            if (viewer._id) {
                return viewer.$update(onSuccess, onError);
            }
            else {
                return viewer.$save(onSuccess, onError);
            }

            // Handle successful response
            function onSuccess(viewer) {
                // Any required internal processing from inside the service, goes here.
            }

            // Handle error response
            function onError(errorResponse) {
                var error = errorResponse.data;
                // Handle error internally
                handleError(error);
            }
        }

        function handleError(error) {
            // Log error
            $log.error(error);
        }
    }
}());
