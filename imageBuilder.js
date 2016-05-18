const xmldom = require('xmldom');


function ImageBuilder()
{
    this.parser = new xmldom.DOMParser();
    this.serializer = new xmldom.XMLSerializer();
}


ImageBuilder.prototype.build = function(template, matchReport)
{
    var doc = this.parser.parseFromString(template, 'image/svg+xml');

    var element = doc.getElementById('homeTeam');
    element.textContent = matchReport.homeTeam;

    element = doc.getElementById('homeScore');
    element.textContent = matchReport.homeScore;

    element = doc.getElementById('awayTeam');
    element.textContent = matchReport.awayTeam;

    element = doc.getElementById('awayScore');
    element.textContent = matchReport.awayScore;

    return this.serializer.serializeToString(doc);
}


module.exports = new ImageBuilder();
