module.exports = {
	exec: f,
	span: 1
}

const characters = require('../classes/characters.js');
const { HEADERS } = require('../classes/constants.js');
const todaysDayOfMonth = new Date().getDate();

async function f(app) {
	runInBackground(app);
}

async function runInBackground(app) {
	if (app.util.isDowntime()) return;

	try {
		let chars = await app.mysql.query('select character_id, name, corporation_id from ew_characters where name != "" and history_added = 0 limit 1');
		for (let i = 0; i < chars.length; i++) {
			if (app.pause420 == true) break;
			if (app.error_count > 0) break;

			let row = chars[i];

			try {
				await app.mysql.query('update ew_characters set history_added = 1 where character_id = ?', [row.character_id]);

				let corpurl = 'https://esi.evetech.net/characters/' + row.character_id + '/corporationhistory';
				const res = await fetch(corpurl, HEADERS);
				await characters.parse_corps(app, res, row, corpurl);
			} catch (e) {
				await app.mysql.query('update ew_characters set history_added = 0 where character_id = ?', [row.character_id]);
				console.error(e);
			}
		}
	} catch (e) {
		console.log(e);
	}
}
