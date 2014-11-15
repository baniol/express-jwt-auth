'use strict';

angular.module('MyApp')
  .controller('LoginCtrl', function ($rootScope, $scope, $location, $message, Auth) {
    $scope.login = function () {
      // @TODO a separate directive
      $scope.inProgress = true;
      Auth.login({ username: $scope.username, password: $scope.password })
        .success(function () {
          $rootScope.loggedin = true;
          $location.path('/');
          // @TODO a separate directive
          $scope.inProgress = false;
          $message('You have successfully logged in.');
        })
        .error(function() {
          // @TODO a separate directive
          $scope.inProgress = false;
          $message('Invalid username or password!');
        });
    };
    $scope.pageClass = 'fadeZoom';
  });
