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
        console.log(report);
        if (report.awayScore > report.homeScore)
            reject("Away victory");

        resolve(0);
    });
}

module.exports = new MatchReportApi();
