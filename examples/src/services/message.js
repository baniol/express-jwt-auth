'use strict';

angular.module('MyApp')
  .factory('$message', function($alert) {
    var alert = function (msg) {
      $alert({
        title: msg,
        type: 'material',
        dismissable: false,
        duration: 3
      });
    };
    return alert;
  });
