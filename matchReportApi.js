const imageBuilder = require('./image-builder/imageBuilder.js');
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
        MatchReportDb.connect(self.dbUrl)
    	.then( MatchReportDb.setup )
    	.then( (connection) =>
    	{
    	    connection.done();
            console.log("Connected to the database.")
            resolve();
    	})
    	.catch( (theError) =>
    	{
            console.log("Failed to connect to the database!")
    	    reject( MatchReportApiError.handle(theError));
    	});
    });
};


MatchReportApi.prototype.getReport = function(reportId)
{
    var self = this;
    return new Promise( function(resolve, reject)
    {
        if (!isInt(reportId))
        {
            reject(new MatchReportApiError(400, "Invalid reportId"));
            return;
        }

        MatchReportDb.connect(self.dbUrl)
        .then( (connection) => MatchReportDb.selectReport(connection, reportId))
        .then( (connection) =>
        {
            connection.done();

            if (connection.report === undefined)
                reject(new MatchReportApiError(404, util.format("Report id '%d' does not exist.", reportId)));
            else
                resolve(connection.report);
        })
        .catch( (theError) => reject( MatchReportApiError.handle(theError)) );
    });
}


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


MatchReportApi.prototype.getTemplate = function(templateId)
{
    var self = this;
    return new Promise( function(resolve, reject)
    {
        if (!isInt(templateId))
        {
            reject(new MatchReportApiError(400, "Invalid templateId"));
            return;
        }

        MatchReportDb.connect(self.dbUrl)
        .then( (connection) => MatchReportDb.selectTemplate(connection, templateId) )
        .then( (connection) =>
        {
            connection.done();

            if (connection.template === undefined)
                reject(new MatchReportApiError(404, util.format("No template found with id: %d", templateId)));
            else
                resolve(connection.template);
        })
        .catch( (theError) => reject( MatchReportApiError.handle(theError)) );
    });
}


MatchReportApi.prototype.getTemplates = function()
{
    var self = this;
    return new Promise( function(resolve, reject)
    {
        MatchReportDb.connect(self.dbUrl)
        .then( MatchReportDb.selectTemplates )
        .then( (connection) =>
        {
            connection.done();
            resolve(connection.templates);
        })
        .catch( (theError) => reject( MatchReportApiError.handle(theError)) );
    });
}


MatchReportApi.prototype.getImageById = function(imageId)
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
        .then( (connection) => MatchReportDb.selectImageById(connection, imageId))
        .then( (connection) =>
        {
            connection.done();

            if (connection.image === undefined)
                reject(new MatchReportApiError(404, util.format("No image found with id: %d", imageId)));
            else
                resolve(connection.image);
        })
        .catch( (theError) => reject( MatchReportApiError.handle(theError)) );
    });
}


MatchReportApi.prototype.getImage = function(reportId, templateId)
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

        MatchReportDb.connect(self.dbUrl)
        .then( (connection) => MatchReportDb.selectImage(connection, reportId, templateId))
        .then( (connection) =>
        {
            if (connection.image !== undefined)
            {
                connection.done();
                resolve(connection.image);
            }
            else
            {
                return MatchReportDb.selectReport(connection, reportId)
                .then( (connection) => 
                {
                    if (connection.report === undefined)
                        reject(new MatchReportApiError(404, util.format("Report id '%d' does not exist.", reportId)));
                    else
                        return MatchReportDb.selectTemplate(connection, templateId);
                })
                .then( (connection) =>
                {
                    if (connection.template === undefined)
                    {
                        reject(new MatchReportApiError(404, util.format("No template found with id: %d", templateId)));
                    }
                    else
                    {
                        connection.image = imageBuilder.build(connection.template.svg, connection.report);
                        return MatchReportDb.insertImage(connection, reportId, templateId, connection.image);
                    }
                })
                .then( (connection) =>
                {
                    resolve(connection.image);
                })
            }
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

        MatchReportDb.connect(self.dbUrl)
        .then( (connection) => MatchReportDb.selectReport(connection, reportId))
        .then( (connection) => MatchReportDb.selectTemplate(connection, templateId))
        .then( (connection) => MatchReportDb.insertImage(connection, reportId, templateId, imageBuilder.build(connection.template.svg, connection.report)) )
        .then( (connection) =>
        {
            resolve(connection.imageId);
        })
        .catch( (theError) => reject( MatchReportApiError.handle(theError)) );

    });
};

module.exports = createMatchReportApi;
