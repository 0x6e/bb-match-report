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
                reject(new MatchReportApiError(500, "Failed to connect to the database!"));
            }
            else
            {
                resolve({client: theClient, done: theDoneFunction});
            }
        });
    });
}


module.exports.setup = function(connection)
{
    return new Promise( function(resolve, reject)
    {
        function querySucceeded(theError)
	{
	    if (theError)
	    {
	        console.log(error);
		connection.done();
		reject(new MatchReportApiError(500, "Failed to setup database"));
		return false;
            }

	    return true;
	}

        // Create match_reports
        connection.client.query(
        "CREATE TABLE IF NOT EXISTS match_reports ("
        + "id serial PRIMARY KEY, "
        + "created timestamp DEFAULT now(), "
        + "home_team text NOT NULL, "
        + "home_coach text NOT NULL, "
        // + "home_race text NOT NULL, "
        + "home_colour text NOT NULL, "
        + "home_score integer NOT NULL, "
        + "away_team text NOT NULL, "
        + "away_coach text NOT NULL, "
        // + "away_race text NOT NULL, "
        + "away_colour text NOT NULL, "
        + "away_score integer NOT NULL "
        + ");"
        , function(error, result)
	{
	    if (!querySucceeded(error))
	        return;

            // Create templates
	    connection.client.query(
            "CREATE TABLE IF NOT EXISTS templates ( "
            + "id serial PRIMARY KEY, "
            + "created timestamp DEFAULT now(), "
            + "name text NOT NULL, "
            + "svg xml NOT NULL "
            + ");"
	    , function(error, result)
	    {
	        if (!querySucceeded(error))
		    return;

                // Create images
		connection.client.query(
		"CREATE TABLE IF NOT EXISTS images ( "
                + "id serial PRIMARY KEY, "
                + "report_id integer NOT NULL REFERENCES match_reports(id) ON UPDATE CASCADE ON DELETE CASCADE, "
                + "template_id integer NOT NULL REFERENCES templates(id) ON UPDATE CASCADE ON DELETE RESTRICT, "
                + "svg xml NOT NULL "
                + ");"
                , function(error, result)
		{
		    if(!querySucceeded(error))
		        return;
		    
		    connection.databaseConfigured = true;
		    resolve(connection);
		});
            });
	});
    });
}


module.exports.selectReport = function (connection, reportId)
{
    return new Promise( function (resolve, reject)
    {
        connection.client.query('SELECT * FROM match_reports WHERE id=$1;'
            , [reportId]
            , function (error, result)
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
                connection.done();
                reject(new MatchReportApiError(404, util.format("Report id '%d' does not exist.", reportId)));
                return;
            }

            var report = {};
            report.homeTeam = result.rows[0].home_team;
            report.homeScore = result.rows[0].home_score;
            report.awayTeam = result.rows[0].away_team;
            report.awayScore = result.rows[0].away_score;

            connection.report = report;
            resolve(connection);
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


module.exports.selectTemplate = function(connection, templateId)
{
    return new Promise( function (resolve, reject)
    {
        connection.client.query('SELECT svg FROM templates WHERE id=$1;', [templateId], function(error, result)
        {
            if (error)
            {
                console.log(error);
                connection.done();
                reject(new MatchReportApiError(500, "Query failed"));
                return;
            }

            if (result.rows.length === 0)
            {
                reject(new MatchReportApiError(404, util.format("No template found with id: %d", templateId)));
            }
            else
            {
                connection.template = result.rows[0].svg;
                resolve(connection);
            }
        });
    });
}


module.exports.insertTemplate = function(connection, templateName, template)
{
    return new Promise( function (resolve, reject)
    {
        connection.client.query('INSERT INTO templates (name, svg) VALUES ($1, $2) RETURNING id;'
            , [templateName, template]
            , function(error, result)
        {
            if (error)
            {
                console.log(error);
                connection.done();
                reject(new MatchReportApiError(500, "Query failed"));
                return;
            }

            connection.tempateId = result.rows[0].id;
            resolve(connection);
        });
    });
}


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

            if (result.rows.length === 0)
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


module.exports.insertImage = function(connection, reportId, templateId, image)
{
    return new Promise( function (resolve, reject)
    {
        connnection.client.query('INSERT INTO images (report_id, template_id, svg) VALUES ($1, $2, XMLPARSE( DOCUMENT $3)) RETURNING id;'
            , [reportId, templateId, image]
            , function(error, result)
        {
            if (error)
            {
                console.log(error);
                connection.done();
                reject(new MatchReportApiError(500, "Query failed"));
                return;
            }

            connection.imageId = result.rows[0].id;
            resolve(connection);
        });
    });
}
