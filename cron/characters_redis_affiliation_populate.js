'use strict';

module.exports = {
    exec: f,
    span: 1
}

var m = false;
var date = undefined;

async function f(app) {
    if (m == false) {
        try {
            m = true;
            if (parseInt(await app.redis.scard('evewho:affiliates') || 0) > 0) return;
            const hours24Ago = Math.floor(Date.now() / 1000) - 86400;

            let chars = await app.mysql.query('select character_id, lastAffUpdated from ew_characters order by lastAffUpdated limit 1000');
            for (let i = 0; i < chars.length; i++) {
                var row = chars[i];
                if (Math.floor(new Date(row.lastAffUpdated).getTime() / 1000) > hours24Ago) break;

                await app.redis.sadd('evewho:affiliates:full', row.character_id);
                await app.redis.sadd('evewho:affiliates', row.character_id);
                await app.mysql.query('update ew_characters set lastAffUpdated = now() where character_id = ?', row.character_id);
            }
        } finally {
            m = false;
        }
    }
}
