'use strict';

var module = angular.module('basic.controllers', ['ui.bootstrap']);

module.controller('HeaderCtrl', ['$scope', function($scope) {
  $scope.template = {
    name: 'header.html',
    url: 'header.html'
  };
}]);

module.controller('FooterCtrl', ['$scope', function($scope) {
  $scope.template = {
    name: 'footer.html',
    url: 'footer.html'
  };
}]);

module.controller('AboutCtrl', ['$scope', function($scope) {
}]);
