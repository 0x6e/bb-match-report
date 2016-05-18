require('dotenv').config();

var bodyParser  = require('body-parser');
var express = require("express");
var matchReportApi = require("./matchReportApi.js");

var app = express();
var api = matchReportApi(process.env.DATABASE_URL);

// Use body-parser middleware to populate request.body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Route all other requests to the web app
app.use(express.static(__dirname + "/public"));

// Connect to the API to check our database connection. Start the app if successful
api.connect().then( () =>
{
    var port = process.env.PORT || 8080;
    var server = app.listen(port, () =>
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
    api.createReport(request.body).then( (theId) =>
    {
        result.status(201).json({ id: theId, report: request.body });
    })
    .catch( (theError) =>
    {
        result.status(theError.status).json(theError);
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
 */


/*  "/image/:id/report.svg"
 *      GET: find image by id
 */
apiRoutes.get('/image/:id/report.svg', function(request, result)
{
    api.getImage(request.params.id).then( (theImage) =>
    {
        result.set('Content-Type', 'image/svg+xml');
        result.status(200).send(theImage);
    })
    .catch( (theError) =>
    {
        result.status(theError.status).json(theError);
    })
});



app.use('/api', apiRoutes);
