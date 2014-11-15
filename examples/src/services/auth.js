'use strict';

angular.module('MyApp')
  .factory('Auth', function ($http, $rootScope, $window, apiUrl) {

    var token = $window.localStorage.token;
    if (token) {
      try {
        var payload = JSON.parse($window.atob(token.split('.')[1]));
        $rootScope.currentUser = payload.user;
        $rootScope.loggedin = true;
      }
      catch (e) {
        console.log(e);
      }
    }

    var saveToken = function (token) {
      $window.localStorage.token = token;
      var payload = JSON.parse($window.atob(token.split('.')[1]));
      $rootScope.currentUser = payload.user;
    };

    return {
      login: function(user) {
        return $http.post(apiUrl + '/auth/login', user)
          .success(function(data) {
            saveToken(data.token);
          })
          .error(function() {
            delete $window.localStorage.token;
          });
      },
      signup: function(user) {
        return $http.post(apiUrl + '/auth/signup', user)
          .success(function (res) {
            saveToken(res.token);
          });
      },
      logout: function() {
        delete $window.localStorage.token;
        $rootScope.currentUser = null;
      },
      editProfile: function (user) {
        return $http.post(apiUrl + '/auth/editprofile/', user)
          .success(function (res) {
            if (res.msg !== 'Data not modified') {
              saveToken(res.token);
            }
          });
      },
      forgotPassword: function (email) {
        return $http.post(apiUrl + '/remindpassword/', email);
      },
      resetPassword: function (token, password) {
        var data = {token: token, password: password};
        return $http.post(apiUrl + '/resetpassword/', data);
      },
      removeAccount: function () {
        // @TODO success + error
        return $http.post(apiUrl + '/auth/removeaccount/');
      },
      keepAlive: function () {
        return $http.post(apiUrl + '/auth/keepalive/')
          .success(function (res) {
            saveToken(res.token);
          });
      }
    };
  });
