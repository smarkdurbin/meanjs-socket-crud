(function () {
  'use strict';

  describe('Admin Viewers List Controller Tests', function () {
    // Initialize global variables
    var ViewersAdminListController,
      $scope,
      $httpBackend,
      $state,
      Authentication,
      ViewersService,
      mockViewer;

    // The $resource service augments the response object with methods for updating and deleting the resource.
    // If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
    // the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
    // When the toEqualData matcher compares two objects, it takes only object properties into
    // account and ignores methods.
    beforeEach(function () {
      jasmine.addMatchers({
        toEqualData: function (util, customEqualityTesters) {
          return {
            compare: function (actual, expected) {
              return {
                pass: angular.equals(actual, expected)
              };
            }
          };
        }
      });
    });

    // Then we can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($controller, $rootScope, _$state_, _$httpBackend_, _Authentication_, _ViewersService_) {
      // Set a new global scope
      $scope = $rootScope.$new();

      // Point global variables to injected services
      $httpBackend = _$httpBackend_;
      $state = _$state_;
      Authentication = _Authentication_;
      ViewersService = _ViewersService_;

      // Ignore parent template get on state transitions
      $httpBackend.whenGET('/modules/viewers/client/views/list-viewers.client.view.html').respond(200, '');
      $httpBackend.whenGET('/modules/core/client/views/home.client.view.html').respond(200, '');

      // create mock viewer
      mockViewer = new ViewersService({
        _id: '525a8422f6d0f87f0e407a33',
        title: 'An Viewer about MEAN',
        content: 'MEAN rocks!'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user', 'admin']
      };

      // Initialize the Viewers List controller.
      ViewersAdminListController = $controller('ViewersAdminListController as vm', {
        $scope: $scope
      });

      // Spy on state go
      spyOn($state, 'go');
    }));

    describe('Instantiate', function () {
      var mockViewerList;

      beforeEach(function () {
        mockViewerList = [mockViewer, mockViewer];
      });

      it('should send a GET request and return all viewers', inject(function (ViewersService) {
        // Set POST response
        $httpBackend.expectGET('/api/viewers').respond(mockViewerList);


        $httpBackend.flush();

        // Test form inputs are reset
        expect($scope.vm.viewers.length).toEqual(2);
        expect($scope.vm.viewers[0]).toEqual(mockViewer);
        expect($scope.vm.viewers[1]).toEqual(mockViewer);

      }));
    });
  });
}());
