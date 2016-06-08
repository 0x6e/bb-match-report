// We will pass these to the wrapper function at the end of the file
(function(isNode, isAngular)
{

    function ImageBuilder(theParser, theSerializer)
    {
        this.parser = theParser;
        this.serializer = theSerializer;
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


    /*
     * Boiler plate to allow this module to be used in Angular and Node
     */

    if (isAngular)
    {
        // AngularJS module definition
        var imageBuilder = angular.module('imageBuilder', []);
        imageBuilder.factory('ImageBuilder', [function ImageBuilderFactory()
        {
            return new ImageBuilder(new DOMParser(), new XMLSerializer());
        }]);
    }
    else if (isNode)
    {
        // NodeJS module definition
        const xmldom = require('xmldom');
        module.exports = new ImageBuilder(new xmldom.DOMParser(), new xmldom.XMLSerializer());
    }

}
) (typeof module !== 'undefined' && module.exports, typeof angular !== 'undefined');
