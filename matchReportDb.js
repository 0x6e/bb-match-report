const MatchReportApiError = require('./matchReportApiError.js');
const pg = require('pg');
const util = require('util');


module.exports.connect = function(dbUrl)
{
    return new Promise( function (resolve, reject)
    {
        pg.connect(dbUrl, function(error, theClient, theDoneFunction)
        {
            if (error)
            {
                // console.log(error);
                done();
                reject(new MatchReportApiError(500, "Failed to connect to the database!"));
            }
            else
            {
                resolve({client: theClient, done: theDoneFunction});
            }
        });
    });
}


module.exports.insertReport = function (connection, report)
{
    return new Promise( function (resolve, reject)
    {
        connection.client.query('INSERT INTO match_reports (home_team, home_coach, home_colour, home_score, away_team, away_coach, away_colour, away_score)\
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)\
                        RETURNING id;'
                    , [report.home.team, report.home.coach, report.home.colour, report.home.score, report.away.team, report.away.coach, report.away.colour, report.away.score]
                    , function(error, result)
        {
            if (error)
            {
                console.log(error);
                connection.done();
                reject(new MatchReportApiError(500, "Query failed"));
                return;
            }

            connection.reportId = result.rows[0].id;
            resolve(connection);
        });
    });
};


module.exports.selectImage = function(connection, imageId)
{
    return new Promise( function (resolve, reject)
    {
        connection.client.query('SELECT svg FROM images WHERE id=$1;', [imageId], function(error, result)
        {
            if (error)
            {
                console.log(error);
                connection.done();
                reject(new MatchReportApiError(500, "Query failed"));
                return;
            }

            if (result.rows.length == 0)
            {
                reject(new MatchReportApiError(404, util.format("No image found with id: %d", imageId)));
            }
            else
            {
                connection.svg = result.rows[0].svg;
                resolve(connection);
            }
        });
    });
}
