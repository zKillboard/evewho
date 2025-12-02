const app = require('fundamen')('www');

// Override Fundamen's MySQL with our own Database class
if (process.env.MYSQL_LOAD == 'true') {
    const Database = require('../classes/Database.js');
    app.mysql = new Database(process.env.MYSQL_URL);
    console.log('Overrode MySQL with local Database class...');
}
