module.exports = {
	paths: '/stats/',
	get: getData
}

async function getData(req, res) {
	const app = req.app.app;
	let stats = defaultStats();

	try {
		const cached = await app.redis.get('stats:summary');
		if (cached != null) stats = { ...stats, ...JSON.parse(cached) };
	} catch (e) {
		console.error('[' + new Date().toISOString() + '] Error in stats cache read:', e);
	}

	return {
		view: 'stats.pug',
		package: stats,
		ttl: 3600
	};
}

function defaultStats() {
	return {
		title: 'Stats',
		generated_at: null,
		refresh_interval_hours: 8,
		alliance_count: 0,
		corporation_count: 0,
		character_count: 0,
		player_corporation_count: 0,
		npc_corporation_count: 0,
		allied_corporation_count: 0,
		independent_corporation_count: 0,
		active_corporation_count: 0,
		inactive_corporation_count: 0,
		non_empty_corporation_count: 0,
		empty_corporation_count: 0,
		populated_alliance_count: 0,
		empty_alliance_count: 0,
		faction_alliance_count: 0,
		characters_in_alliances_count: 0,
		unaffiliated_character_count: 0,
		faction_character_count: 0,
		faction_corporation_count: 0,
		history_complete_count: 0,
		history_pending_count: 0,
		recent_change_count: 0,
		avg_player_corporation_members: 0,
		avg_alliance_members: 0,
		largest_corporation_id: 0,
		largest_corporation_name: 'N/A',
		largest_corporation_members: 0,
		largest_alliance_id: 0,
		largest_alliance_name: 'N/A',
		largest_alliance_members: 0
	};
}