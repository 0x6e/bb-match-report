var bodyParser  = require('body-parser');
var express = require("express");
var matchReportApi = require("./matchReportApi.js");

var app = express();

// Use body-parser middleware to populate request.body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Route all other requests to the web app
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
apiRoutes.post('/report', function(request, result)
{
    matchReportApi.createReport(request.body).then( (theId) =>
    {
        result.status(201).json({ id: theId, report: request.body });
    })
    .catch( (theError) =>
    {
        result.status(400).json({ status: 400, message: theError });
    });
});


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
