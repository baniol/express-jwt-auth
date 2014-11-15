'use strict';

angular.module('MyApp', ['MyApp.config','ngResource', 'ngRoute', 'ngAnimate', 'mgcrea.ngStrap'])
  .config(function ($routeProvider, $locationProvider) {

    // $locationProvider.html5Mode(true);

    $routeProvider
      .when('/', {
        templateUrl: 'views/home.html',
        controller: 'MainCtrl'
      })
      .when('/test', {
        templateUrl: 'views/test.html',
        controller: 'TestCtrl'
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      })
      .when('/signup', {
        templateUrl: 'views/signup.html',
        controller: 'SignupCtrl'
      })
      .when('/editprofile', {
        templateUrl: 'views/editprofile.html',
        controller: 'EditProfileCtrl'
      })
      .when('/forgot', {
        templateUrl: 'views/forgotpassword.html',
        controller: 'ForgotPasswordCtrl'
      })
      .when('/resetpassword', {
        templateUrl: 'views/resetpassword.html',
        controller: 'ResetPasswordCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .config(function ($httpProvider) {
    $httpProvider.interceptors.push(function ($rootScope, $q, $window, $location) {
      return {
        request: function(config) {
          if ($window.localStorage.token) {
            config.headers.Authorization = 'Bearer ' + $window.localStorage.token;
          }
          return config;
        },
        responseError: function(response) {
          if (response.status === 401) {
            // @TODO code repetition - Auth logout
            delete $window.localStorage.token;
            $rootScope.currentUser = null;
            $location.path('/login');
          }
          return $q.reject(response);
        }
      };
    });
  })
  .run(function ($rootScope, $interval, Auth, KeepAliveInterval) {
    var keepAlive;
    if ($rootScope.currentUser) {
      $rootScope.loggedin = true;
    }
    // Run keepalive interval on logged in
    // @TODO move to Auth
    $rootScope.$watch('loggedin', function () {
      if ($rootScope.loggedin) {
        keepAlive = $interval(function () {
          Auth.keepAlive();
        }, KeepAliveInterval * 1000);
      }
      else {
        $interval.cancel(keepAlive);
      }
    });
  });
