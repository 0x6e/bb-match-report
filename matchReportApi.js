const pg = require('pg');
const util = require('util');


function createMatchReportApi(databaseUrl)
{
    return new MatchReportApi(databaseUrl);
}


function MatchReportApi(databaseUrl)
{
    this.dbUrl = databaseUrl;
}


function MatchReportApiError(status, message)
{
    this.status = status;
    this.message = message;
}


MatchReportApi.prototype.connect = function()
{
    var self = this;
    return new Promise( function(resolve, reject)
    {
        pg.connect(self.dbUrl, function(error, client, done)
        {
            done();

            if (error)
            {
                console.log("Failed to connect to the database!")
                reject(error);
            }
            else
            {
                console.log("Connected to the database.")
                resolve();
            }
        });
    });
};


MatchReportApi.prototype.createReport = function(report)
{
    var self = this;
    return new Promise( function(resolve, reject)
    {
        // Validate the data
        if (report === undefined)
        {
            reject(new MatchReportApiError(400, "report is undefined"));
            return;
        }

        function teamIsValid(teamType, team)
        {
            if (team === undefined)
            {
                reject(new MatchReportApiError(400, util.format("'%s' is undefined", teamType)) );
                return false;
            }

            if (team.team === undefined)
            {
                reject(new MatchReportApiError(400, util.format("'team' is undefined for '%s'", teamType)) );
                return false;
            }

            if (team.coach === undefined)
            {
                reject(new MatchReportApiError(400, util.format("'coach' is undefined for '%s'", teamType)) );
                return false;
            }

            if (team.colour === undefined)
            {
                reject(new MatchReportApiError(400, util.format("'colour' is undefined for '%s", teamType)) );
                return false;
            }

            if (team.score === undefined)
            {
                reject(new MatchReportApiError(400, util.format("'score' is undefined for '%s'", teamType)) );
                return false;
            }
            else if (team.score < 0)
            {
                reject(new MatchReportApiError(400, util.format("'score' is invalid for '%s'", teamType)) );
                return false;
            }

            return true;
        };

        if (!teamIsValid("home", report.home) || !teamIsValid("away", report.away))
            return;

        // Insert the data into the database
        pg.connect(self.dbUrl, function(error, client, done)
        {
            if (error)
            {
                // console.log(error);
                done();
                reject(new MatchReportApiError(500, "Failed to connect to the database!"));
                return;
            };

            client.query('INSERT INTO match_reports (home_team, home_coach, home_colour, home_score, away_team, away_coach, away_colour, away_score)\
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)\
                            RETURNING id;'
                        , [report.home.team, report.home.coach, report.home.colour, report.home.score, report.away.team, report.away.coach, report.away.colour, report.away.score]
                        , function(error, result)
            {
                done();
                if (error)
                {
                    console.log(error);
                    reject(new MatchReportApiError(500, "Query failed"));
                }
                else
                {
                    resolve(result.rows[0].id);
                }
            });
        });
    });
}

module.exports = createMatchReportApi;
