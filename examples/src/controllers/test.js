'use strict';
angular.module('MyApp')
  .controller('TestCtrl', function($scope, $http, apiUrl) {
    $http.get(apiUrl + '/api/test').success(function (data) {
      console.log(data);
    }).error(function (data) {
      console.log('error');
      console.log(data);
    })
  });