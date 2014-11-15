'use strict';

angular.module('MyApp')
  .controller('SignupCtrl', function($scope, Auth, $location, $message, $parse) {

    $scope.signup = function() {
      // @TODO a separate directive
      $scope.inProgress = true;
      Auth.signup({
        username: $scope.username,
        email: $scope.email,
        password: $scope.password
      })
      .success(function () {
        // @TODO a separate directive
        $scope.inProgress = false;
        $location.path('/');
        $message('Your account has been created.');
      })
      // Server message idea from : http://stackoverflow.com/a/16478056
      .error(function (err) {
        // @TODO a separate directive
        $scope.inProgress = false;
        for(var field in err) {
          var el = err[field];
          var serverMessage = $parse('signupForm.'+el.param+'.$error.server');
          $scope.signupForm[el.param].$setValidity('server', false);
          serverMessage.assign($scope, el.msg);
        }
      });
    };
    $scope.pageClass = 'fadeZoom';

    $scope.keyPress = function() {
      if ($scope.signupForm.$invalid) {
        $scope.signupForm.username.$setValidity('server', true);
        $scope.signupForm.email.$setValidity('server', true);
        $scope.signupForm.password.$setValidity('server', true);
      }
    };
  });
