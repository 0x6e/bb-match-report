const util = require('util');

function MatchReportApi()
{

}


MatchReportApi.prototype.connect = function()
{
    return new Promise( function(resolve, reject)
    {
        console.log("Connecting...");
        resolve();
    });
};


MatchReportApi.prototype.createReport = function(report)
{
    return new Promise( function(resolve, reject)
    {
        // Validate the data
        if (report === undefined)
        {
            reject("report is undefined");
            return;
        }

        function teamIsValid(teamType, team)
        {
            if (team === undefined)
            {
                reject(util.format("'%s' is undefined", teamType));
                return false;
            }

            if (team.team === undefined)
            {
                reject(util.format("'team' is undefined for '%s'", teamType));
                return false;
            }

            if (team.coach === undefined)
            {
                reject(util.format("'coach' is undefined for '%s'", teamType));
                return false;
            }

            if (team.colour === undefined)
            {
                reject(util.format("'colour' is undefined for '%s'", teamType));
                return false;
            }

            if (team.score === undefined)
            {
                reject(util.format("'score' is undefined for '%s'", teamType));
                return false;
            }
            else if (team.score < 0)
            {
                reject(util.format("'score' is invalid for '%s'", teamType));
                return false;
            }

            return true;
        };

        if (!teamIsValid("home", report.home) || !teamIsValid("away", report.away))
            return;

        resolve(0);
    });
}

module.exports = new MatchReportApi();
