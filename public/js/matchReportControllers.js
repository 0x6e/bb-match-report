var controllers = angular.module('matchReportControllers', []);

controllers.controller('RootCtrl', ['$scope',
    function ($scope) {
        // ...
    }]);

controllers.controller('ReportCreationController'
    , ['$scope', '$location', 'MatchReport'
    , function($scope, $location, MatchReport)
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


controllers.controller('MatchReportPreviewController'
    , ['$scope', '$location', '$routeParams', 'MatchReport', 'Templates'
    , function($scope, $location, $routeParams, MatchReport, Templates)
{
    // Determine the host name for the image URLs
    if ($location.port() === 80)
    {
        $scope.host = $location.host();
    }
    else
    {
        $scope.host = $location.host() + ':' + $location.port();
    }

    // Request the report
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

    // Request the templates
    Templates.query()
    .$promise
    .then( (theTemplates) =>
    {
        $scope.templates = theTemplates;
    })
    .catch( (error) =>
    {
        console.log(error)
    });
}]);
