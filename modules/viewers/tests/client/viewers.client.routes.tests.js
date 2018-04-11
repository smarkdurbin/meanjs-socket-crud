(function () {
  'use strict';

  describe('Viewers Route Tests', function () {
    // Initialize global variables
    var $scope,
      ViewersService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _ViewersService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      ViewersService = _ViewersService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('viewers');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/viewers');
        });

        it('Should be abstract', function () {
          expect(mainstate.abstract).toBe(true);
        });

        it('Should have template', function () {
          expect(mainstate.template).toBe('<ui-view/>');
        });
      });

      describe('List Route', function () {
        var liststate;
        beforeEach(inject(function ($state) {
          liststate = $state.get('viewers.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should not be abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe('/modules/viewers/client/views/list-viewers.client.view.html');
        });
      });

      describe('View Route', function () {
        var viewstate,
          ViewersController,
          mockViewer;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('viewers.view');
          $templateCache.put('/modules/viewers/client/views/view-viewer.client.view.html', '');

          // create mock viewer
          mockViewer = new ViewersService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Viewer about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          ViewersController = $controller('ViewersController as vm', {
            $scope: $scope,
            viewerResolve: mockViewer
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:viewerId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.viewerResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            viewerId: 1
          })).toEqual('/viewers/1');
        }));

        it('should attach an viewer to the controller scope', function () {
          expect($scope.vm.viewer._id).toBe(mockViewer._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('/modules/viewers/client/views/view-viewer.client.view.html');
        });
      });

      describe('Handle Trailing Slash', function () {
        beforeEach(inject(function ($state, $rootScope, $templateCache) {
          $templateCache.put('/modules/viewers/client/views/list-viewers.client.view.html', '');

          $state.go('viewers.list');
          $rootScope.$digest();
        }));

        it('Should remove trailing slash', inject(function ($state, $location, $rootScope) {
          $location.path('viewers/');
          $rootScope.$digest();

          expect($location.path()).toBe('/viewers');
          expect($state.current.templateUrl).toBe('/modules/viewers/client/views/list-viewers.client.view.html');
        }));
      });
    });
  });
}());
