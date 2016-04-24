const fs = require('fs');
const http = require('http');
const util = require('util');

const apiDetails = JSON.parse(fs.readFileSync('api-details.json', 'utf8'));

function getMatchData(matchId)
{
  const apiPath = '/bbdb/api/matchdetail.php?match_id=%d&api_key=%s&version=%d';

  var options = {
    hostname: apiDetails.host
    , path: util.format(apiPath, matchId, apiDetails.key, apiDetails.version)
  };

  http.get(options, (res) => {

    res.on("data", function(chunk) {
      var body;
      try {
        body = JSON.parse(chunk);
      } catch (e) {
        // Not all responses return JSON
      }

      if ( body === undefined || body.error_code !== undefined) {
        console.log("This is not the JSON you are looking for.");
        // Bomb out here
        return;
      }

      console.log(body);

    });

    res.resume();
  }).on('error', (e) => {
    console.log(`Got error: ${e.message}`);
  });
}

getMatchData(173);
