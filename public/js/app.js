var app = angular.module('app', [
    'ngRoute',
    'matchReportApi',
    'matchReportControllers'
]);

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
    when('/create', {
        templateUrl: 'partials/create.html',
        controller: 'ReportCreationController'
    }).
    when('/preview/:reportId', {
        templateUrl: 'partials/preview.html',
        controller: 'MatchReportPreviewController'
    }).
    otherwise({
        redirectTo: '/',
        templateUrl: 'partials/root.html',
        controller: 'RootCtrl'
    });
}]);
