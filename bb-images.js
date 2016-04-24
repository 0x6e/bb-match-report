const fs = require('fs');
const http = require('http');
const util = require('util');

const apiDetails = JSON.parse(fs.readFileSync('api-details.json', 'utf8'));

function getMatchDetail(matchId)
{
  const apiPath = '/bbdb/api/matchdetail.php?match_id=%d&api_key=%s&version=%d';

  return new Promise( function(resolve, reject) {
    var options = {
      hostname: apiDetails.host
      , path: util.format(apiPath, matchId, apiDetails.key, apiDetails.version)
    };

    http.get(options, (res) => {

      res.on('data', (chunk) => {
        var body;
        try {
          body = JSON.parse(chunk);
        } catch (e) {
          // Not all responses return JSON
        }

        if (body === undefined) {
          // The one case not handled with JSON
          reject('Invalid match ID');
          return;
        }

        if (body.error_code !== undefined) {
          reject(body.error_description);
          return;
        }

        // console.log(body);
        resolve(body);
      });

      res.resume();
    }).on('error', (e) => {
      reject(e.message);
    });
  });
}

getMatchDetail(173).then((matchReport) => {
  console.log(matchReport);
}).catch ((error) => {
  console.log(error);
});
