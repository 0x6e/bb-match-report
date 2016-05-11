var express = require("express");
var matchReportApi = require("./matchReportApi.js");

var app = express();
// TODO Set up the Angular web app in the /public subdirectory
app.use(express.static(__dirname + "/public"));

// TODO Create a database connection and connect to it before starting the app.
matchReportApi.connect().then( () =>
{
    var port = process.env.PORT || 8080;
    var server = app.listen(port, function ()
    {
        console.log("App now running on port", port);
    });
})
.catch( (error) =>
{
    console.log(error);
});


// Match report API routes below


// TODO Implement the bare minimum API routes to get started
var apiRoutes = express.Router();

/*  "/report"
 *      POST: create a new report
 */


/*  "/report/:id"
 *      GET: find a report by id
 */


/*  "/template/:id"
 *      GET: find a template by id
 */


/*  "/image"
 *      POST: create an image for the given report and template id


/*  "/image/:id/report.svg"
 *      GET: find image by id
 */

app.use('/api', apiRoutes);
