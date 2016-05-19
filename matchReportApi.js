const imageBuilder = require('./imageBuilder.js');
const MatchReportApiError = require('./matchReportApiError.js');
const MatchReportDb = require('./matchReportDb.js');
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


function isInt(value)
{
    if (isNaN(value))
        return false;

    var x = parseFloat(value);
    return (x | 0) === x;
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

        MatchReportDb.connect(self.dbUrl)
        .then( (connection) => MatchReportDb.insertReport(connection, report))
        .then( (connection) =>
        {
            connection.done();
            resolve(connection.reportId);
        })
        .catch( (theError) => reject( MatchReportApiError.handle(theError)) );
    });
}


MatchReportApi.prototype.getImage = function(imageId)
{
    var self = this;
    return new Promise( function(resolve, reject)
    {
        if (!isInt(imageId))
        {
            reject(new MatchReportApiError(400, "Invalid imageId"));
            return;
        }

        MatchReportDb.connect(self.dbUrl)
        .then( (connection) => MatchReportDb.selectImage(connection, imageId))
        .then( (connection) =>
        {
            connection.done();
            resolve(connection.svg);
        })
        .catch( (theError) => reject( MatchReportApiError.handle(theError)) );
    });
}


MatchReportApi.prototype.createImage = function(reportId, templateId)
{
    var self = this;
    return new Promise( function(resolve, reject)
    {
        if (!isInt(reportId))
        {
            reject(new MatchReportApiError(400, "Invalid reportId"));
            return;
        }

        if (!isInt(templateId))
        {
            reject(new MatchReportApiError(400, "Invalid templateId"));
            return;
        }

        pg.connect(self.dbUrl, function(error, client, done)
        {
            if (error)
            {
                done();
                reject(new MatchReportApiError(500, "Failed to connect to the database!"));
                return;
            };

            client.query('SELECT templates.svg, match_reports.home_team, match_reports.home_score, match_reports.away_team, match_reports.away_score FROM match_reports, templates WHERE match_reports.id=$1 AND templates.id=$2;'
                        , [reportId, templateId]
                        , function(error, result)
            {
                if (error)
                {
                    console.log(error);
                    reject(new MatchReportApiError(500, "Query failed"));
                    return;
                }

                if (result.rows.length == 0)
                {
                    done();
                    reject(new MatchReportApiError(404, util.format("Could not match reportId(%d) and templateId(%d)", reportId, templateId)));
                    return;
                }

                var report = {};
                report.homeTeam = result.rows[0].home_team;
                report.homeScore = result.rows[0].home_score;
                report.awayTeam = result.rows[0].away_team;
                report.awayScore = result.rows[0].away_score;

                var image = imageBuilder.build(result.rows[0].svg, report);

                client.query('INSERT INTO images (report_id, template_id, svg) VALUES ($1, $2, XMLPARSE( DOCUMENT $3)) RETURNING id;'
                            , [reportId, templateId, image]
                            , function(insertError, insertResult)
                {
                    done();
                    if (insertError)
                    {
                        console.log(insertError);
                        reject(new MatchReportApiError(500, "Query failed"));
                        return;
                    }

                    resolve(insertResult.rows[0].id);
                });
            });
        });
    });
};

module.exports = createMatchReportApi;
