module.exports = f;

const entity = require('../classes/entity.js');

async function f(app) {
    let result = await app.phin('https://esi.evetech.net/latest/alliances/');
    let alliances = result.body;
    for (let i = 0; i < alliances.length; i++ ) {
        await entity.add(app, 'alli', alliances[i]);
    }
}
