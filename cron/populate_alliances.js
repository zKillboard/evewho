module.exports = {
    exec: f,
    span: 3600
}
const { HEADERS } = require('../classes/constants.js');
const entity = require('../classes/entity.js');

async function f(app) {
	let res = await fetch('https://esi.evetech.net/alliances/', HEADERS);
	let alliances = await res.json();
    for (let i = 0; i < alliances.length; i++ ) {
        await entity.add(app, 'alli', alliances[i]);
    }
}
