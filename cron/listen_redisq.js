module.exports = {
    exec: f,
    span: 15
}

const entity = require('../classes/entity.js');

async function f(app) {
    let url = 'https://redisq.zkillboard.com/listen.php?ttl=5&queueID=' + process.env.redisqID;
    try {
        do {
            let res = await app.phin(url);
            var body = JSON.parse(res.body);
            if (body.package !== null) {
                await add_entities(app, body.package.killmail.victim);
                for (let i = 0; i < body.package.killmail.attackers.length; i++) {
                    await add_entities(app, body.package.killmail.attackers[i]);
                }
            }
        } while (body.package !== null); 
    } catch (e) {
        // Just ignore the error, try again later
    }
}

async function add_entities(app, block) {
    await add_entity(app, 'alli', block.alliance_id);
    await add_entity(app, 'corp', block.corporation_id);
    await add_entity(app, 'char', block.character_id);
}  

async function add_entity(app, type, id) {
    await entity.add(app, type, id);
}
