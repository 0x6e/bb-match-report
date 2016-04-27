const fs = require('fs');
const xmldom = require('xmldom');

var parser = new xmldom.DOMParser();
var serializer = new xmldom.XMLSerializer();

fs.readFile('test.svg', 'utf8', (error, data) => {
    if (error)
        throw error;

    var doc = parser.parseFromString(data, 'image/svg+xml');

    var element = doc.getElementById('homeTeam');
    element.textContent = "No Stable Isotopes";

    element = doc.getElementById('homeScore');
    element.textContent = "4";

    element = doc.getElementById('awayTeam');
    element.textContent = "The Cheeseosophers"

    element = doc.getElementById('awayScore');
    element.textContent = "5";

    var docSvg = serializer.serializeToString(doc);
    fs.writeFile('output.svg', docSvg);
});
