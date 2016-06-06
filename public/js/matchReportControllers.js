var controllers = angular.module('matchReportControllers', []);

controllers.controller('RootCtrl', ['$scope',
    function ($scope) {
        // ...
    }]);

controllers.controller('ReportCreationController', ['$scope', '$location', 'MatchReport', function($scope, $location, MatchReport)
{
    $scope.report = new MatchReport({ home: { colour: '#ffffff' }, away: { colour: '#ffffff' }});

    $scope.submit = function()
    {
        // console.log($scope.report);
        $scope.report.$save()
        .then( (result) =>
        {
            console.log(result);
            $location.path('/preview/' + result.id);
        })
        .catch( (error) =>
        {
            console.log(error)
        });
    }
}]);


controllers.controller('MatchReportPreviewController', ['$scope', '$routeParams', 'MatchReport', function($scope, $routeParams, MatchReport)
{
    MatchReport.get({id: $routeParams.reportId})
    .$promise
    .then( (theReport) =>
    {
        $scope.report = theReport;
    })
    .catch( (error) =>
    {
        console.log(error)
    });
}]);
