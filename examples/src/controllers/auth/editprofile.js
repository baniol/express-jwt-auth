'use strict';

angular.module('MyApp')
  .controller('EditProfileCtrl', function($rootScope, $scope, $http, apiUrl, Auth, $parse, $message, $location) {

    var user = $rootScope.currentUser;

    var setUserData = function () {
      $scope.username = user.name;
      $scope.email = user.email;
      $scope.password = '';
    };

    $http.post(apiUrl + '/auth/checkauth').success(function (data) {
      setUserData();
    });

    $scope.editSubmit = function() {
      // @TODO a separate directive
      $scope.inProgress = true;
      Auth.editProfile({
        username: $scope.username,
        email: $scope.email,
        password: $scope.password
      })
      .success(function (res) {
        // @TODO duplication in Auth
        if (res.msg === 'Data not modified') {
          $message(res.msg);
        }
        else {
          $message('Data saved');
        }
        if ($scope.password !== '') {
          $scope.password = '';
        }
        // @TODO a separate directive
        $scope.inProgress = false;
      })
      .error(function (err) {
        // @TODO a separate directive
        $scope.inProgress = false;
        for(var field in err) {
          var el = err[field];
          var serverMessage = $parse('editForm.'+el.param+'.$error.server');
          $scope.editForm[el.param].$setValidity('server', false);
          serverMessage.assign($scope, el.msg);
        }
      });
    };

    $scope.removeAccount = function () {
      if(confirm('Are you sure?')) {
        var remove = Auth.removeAccount();
        remove.success(function () {
          Auth.logout();
          $location.path('/');
        });
      }
    };

    $scope.keyPress = function() {
      if ($scope.editForm.$invalid) {
        $scope.editForm.username.$setValidity('server', true);
        $scope.editForm.email.$setValidity('server', true);
        $scope.editForm.password.$setValidity('server', true);
      }
    };

    $scope.pageClass = 'fadeZoom';
  });