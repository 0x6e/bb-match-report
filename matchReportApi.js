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

module.exports = new MatchReportApi();
