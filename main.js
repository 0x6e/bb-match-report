require('dotenv').config();
var pg = require('pg');

pg.connect(process.env.DATABASE_URL, function(error, client, done)
{
    if (error)
        throw error;

    client.query('SELECT * FROM test_table', function(error, result)
    {
        done();
        if (error)
        {
            console.log(error);
        }
        else
        {
            console.log(result.rows);
        }
    });
});
