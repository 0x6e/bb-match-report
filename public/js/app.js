var app = angular.module('app', [
    'ngRoute',
    'matchReportControllers'
]);

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
    otherwise({
        redirectTo: '/',
        templateUrl: 'partials/root.html',
        controller: 'RootCtrl'
    });
}]);
