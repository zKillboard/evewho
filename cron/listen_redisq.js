module.exports = f;

async function f(app) {
    let url = 'https://redisq.zkillboard.com/listen.php';
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
    await add_entity(app, 'ew_alliances', 'alliance_id', block.alliance_id);
    await add_entity(app, 'ew_corporations', 'corporation_id', block.corporation_id);
    await add_entity(app, 'ew_characters', 'character_id', block.character_id);
}  

async function add_entity(app, table, column, id) {
    if (id > 1) {
        await app.mysql.query('insert ignore into ' + table + ' (' + column + ') values (?)', [id]);
    }
}
