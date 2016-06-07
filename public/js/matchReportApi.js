'use strict';

var matchReportApi = angular.module('matchReportApi', ['ngResource']);

matchReportApi.factory("MatchReport", function($resource)
{
    return $resource("/api/report/:id");
});

matchReportApi.factory("Templates", function($resource)
{
    return $resource("/api/templates/:id");
});
