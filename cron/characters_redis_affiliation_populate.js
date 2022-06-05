'use strict';

var m = false;
var date = undefined;

async function f(app) {
    if (m == false) {
        m = true;
        if (parseInt(await app.redis.scard('evewho:affiliates') || 0) == 0) {
            var today = new Date().getDate().toString();
            if (today != await app.redis.get('evewho:affiliates:populated')) {
                await app.redis.sunionstore('evewho:affiliates', 'evewho:affiliates:full');
                console.log('Reset evewho:affiliates set');
                await app.redis.setex('evewho:affiliates:populated', 86400, today);
            }
        }

        try {
            let chars = await app.mysql.query('select character_id from ew_characters where lastAffUpdated = 0');
            for (let i = 0; i < chars.length; i++) {
                var row = chars[i];
                await app.redis.sadd('evewho:affiliates:full', row.character_id);
                await app.redis.sadd('evewho:affiliates', row.character_id);
                await app.mysql.query('update ew_characters set lastAffUpdated = now() where character_id = ?', row.character_id);
            }
            if (chars.length > 100) console.log('Affiliate prepared ', chars.length, 'characters');
        } finally {
            m = false;
        }
    }
}

module.exports = f;
