'use strict';

class MatchReportApiError
{
    constructor (status, message)
    {
        this.status = status;
        this.message = message;
    }


    static handle (theError)
    {
        if (theError instanceof MatchReportApiError)
            return theError;

        console.log(theError);
        return new MatchReportApiError(500, "Unhandled server error");
    }
}

module.exports = MatchReportApiError;
