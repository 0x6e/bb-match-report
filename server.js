require('dotenv').config();

var bodyParser  = require('body-parser');
var express = require('express');
var matchReportApi = require('./matchReportApi.js');

var app = express();
var api = matchReportApi(process.env.DATABASE_URL);

// Use body-parser middleware to populate request.body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Route all other requests to the web app
app.use(express.static(__dirname + "/public"));
app.use('/image-builder', express.static(__dirname + "/image-builder"));

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
apiRoutes.get('/report/:id', function(request, result)
{
    api.getReport(request.params.id).then( (theReport) =>
    {
        result.status(200).json(theReport);
    })
    .catch( (theError) =>
    {
        result.status(theError.status).json(theError);
    })
});


/*  "/template/:id"
 *      GET: find a template by id
 */


 /* "/templates/:id?"
  *     GET: return an array of the available templates
  */
apiRoutes.get('/templates/:id?', function(request, result, next)
{
    if (request.params.id === undefined)
    {
        next();
        return;
    }

    api.getTemplate(request.params.id).then( (theTemplate) =>
    {
        result.status(200).json(theTemplate);
    })
    .catch( (theError) =>
    {
        result.status(theError.status).json(theError);
    })
}
, function(request, result)
{
    api.getTemplates().then( (theTemplates) =>
    {
        result.status(200).json(theTemplates);
    })
    .catch( (theError) =>
    {
        result.status(theError.status).json(theError);
    })
});


/*  "/image/:reportId/:templateId"
 *      POST: create an image for the given report and template id
 */
apiRoutes.post('/image/:reportId/:templateId', function(request, result)
{
    api.createImage(request.params.reportId, request.params.templateId).then( (imageId) =>
    {
        result.status(201).json({ id: imageId });
    })
    .catch( (theError) =>
    {
        result.status(theError.status).json(theError);
    })
});


/*  "/image/:id/report.svg"
 *      GET: find image by id
 */
apiRoutes.get('/image/:id/report.svg', function(request, result)
{
    api.getImageById(request.params.id).then( (theImage) =>
    {
        result.set('Content-Type', 'image/svg+xml');
        result.status(200).send(theImage);
    })
    .catch( (theError) =>
    {
        result.status(theError.status).json(theError);
    })
});


/* "/image/:reportId/:templateId"
 *      GET: find image by report and template ids
 */
apiRoutes.get('/image/:reportId/:templateId', function(request, result)
{
    api.getImage(request.params.reportId, request.params.templateId).then( (theImage) =>
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
