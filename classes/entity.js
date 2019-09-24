module.exports.add = add;

async function add(app, type, id) {
    if (id === undefined || id === null || id < 10000) return;

    let query;
    switch (type) {
        case 'char':
            query = 'insert ignore into ew_characters (character_id) values (?)';
            break;
        case 'corp':
            query = 'insert ignore into ew_corporations (corporation_id) values (?)';
            break;
        case 'alli':
            query = 'insert ignore into ew_alliances (alliance_id) values (?)';
            break;
        default:
            throw 'Unknown type: ' + type;
    }

    let ret = await app.mysql.query(query, [id]);
    if (ret.affectedRows > 0) console.log('Added type ' + type + ': ' + id);
    return ret;
}
