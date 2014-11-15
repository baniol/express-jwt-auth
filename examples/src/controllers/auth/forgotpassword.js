'use strict';

angular.module('MyApp')
  .controller('ForgotPasswordCtrl', function($scope, Auth, $message) {
    $scope.sendEmail = function() {
      // @TODO a separate directive
      $scope.inProgress = true;
      $scope.mailSent = false;
      Auth.forgotPassword({email: $scope.email})
      .success(function () {
        // @TODO a separate directive
        $scope.inProgress = false;
        $message('Password sent');
        $scope.mailSent = true;
        // $location.path('/login');
      })
      .error(function (err) {
        // @TODO a separate directive
        $scope.inProgress = false;
        $message(err[0].msg);
      });
    };
    $scope.pageClass = 'fadeZoom';
  });
