module.exports = {
	exec: f,
	span: 1
}

async function f(app) {
	let rows = await app.mysql.query('SELECT character_id FROM ew_characters WHERE lastNameUpdate < DATE_SUB(NOW(), INTERVAL 24 HOUR) LIMIT 1000');
	let characterIDs = rows.map(r => r.character_id);
	if (characterIDs.length > 0) await update_names(app, characterIDs);
}

async function update_names(app, characterIDs) {
	try {
        let url = 'https://esi.evetech.net/universe/names';
        let data = JSON.stringify(characterIDs);
        let params = {url: url, method: 'post', data: data};
        let names = await app.phin(params);
        let namesJson = JSON.parse(names.body);
	
		let updatePromises = namesJson.map(async (entry) => {
			if (entry.category === 'character') {
				await app.mysql.query('UPDATE ew_characters SET name = ?, name_phonetic = soundex(?), lastNameUpdate = NOW() WHERE character_id = ?', [entry.name, entry.name, entry.id]);
			}
		});
	
		await Promise.all(updatePromises);
	} catch (e) {
		if (characterIDs.length > 1) {
			await app.sleep(1000); // brief pause before retrying
			const middle = Math.ceil(characterIDs.length / 2);
			await update_names(characterIDs.slice(0, middle));
			await update_names(characterIDs.slice(middle));
		} else {
			// try the single entry again in a few minutes
			await app.mysql.query('UPDATE ew_characters SET lastNameUpdate = DATE_ADD(NOW(), INTERVAL 5 MINUTE) WHERE character_id = ?', [characterIDs[0]]);
		}
	}
}

