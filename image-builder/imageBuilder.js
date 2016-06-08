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
        console.log(matchReport);
        var doc = this.parser.parseFromString(template, 'image/svg+xml');

        function updateInnerText(element, text)
        {
            var elements = element.getElementsByTagName('tspan');
            if (elements.length === 0)
                return;

            elements[0].textContent = text;
        }

        var element = doc.getElementById('homeTeam');
        updateInnerText(element, matchReport.homeTeam);

        element = doc.getElementById('homeScore');
        updateInnerText(element, matchReport.homeScore);

        element = doc.getElementById('awayTeam');
        updateInnerText(element, matchReport.awayTeam);

        element = doc.getElementById('awayScore');
        updateInnerText(element, matchReport.awayScore);

        return this.serializer.serializeToString(doc);
    }


    /*
     * Boiler plate to allow this module to be used in Angular and Node
     */

    if (isAngular)
    {
        // AngularJS module definition
        var imageBuilder = angular.module('imageBuilder', []);

        // The ImageBuilderFactory
        imageBuilder.factory('ImageBuilder', [function ImageBuilderFactory()
        {
            return new ImageBuilder(new DOMParser(), new XMLSerializer());
        }]);

        // A directive for rendering the SVG images
        imageBuilder.directive('matchReportSvg', [ 'ImageBuilder', function(ImageBuilder)
        {
            function postLink(scope, element, attributes)
            {
                var template = attributes.svg;
                var report = angular.fromJson(attributes.report);
                
                element.html(ImageBuilder.build(template, report));
            }

            return {
                restrict: 'E',
                templateNamespace: 'svg',
                link: postLink
            };
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
