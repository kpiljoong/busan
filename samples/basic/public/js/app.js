'use stirct';

angular.module('basic', [
  'ngRoute',
  'ngResource',
  'basic.controllers'
])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/about', {
    controller: 'AboutCtrl',
    templateUrl: 'tpl/about.html'
  });

  $routeProvider.otherwise({
    redirectTo: '/'
  });
}]);
