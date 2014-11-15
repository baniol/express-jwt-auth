'use strict';

describe('Controller: EditprofileCtrl', function () {

  // load the controller's module
  beforeEach(module('myAppApp'));

  var EditprofileCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    EditprofileCtrl = $controller('EditprofileCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
