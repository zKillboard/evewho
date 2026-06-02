module.exports = {
	paths: ['/api/:type/:id', '/api/:type/:id/page/:page'],
	get: getData
}

const PAGE_SIZE = 500;
const TOTAL_CACHE_TTL = 900;


async function getData(req, res) {
	const app = req.app.app;

	if (req.params.type == 'character') return getChar(req, res);
	if (req.params.type == 'corplist') return getCorp(req, res);
	if (req.params.type == 'allilist') return getAlli(req, res);

	if (req.params.type == 'corpdeparted') return getCorpDeparted(req, res);
	if (req.params.type == 'corpjoined') return getCorpJoined(req, res);

	return { json: {}, ttl: 86400 }; // 1 day
}

async function getChar(req, res) {
	const app = req.app.app;

	let info = await app.mysql.query('select character_id, corporation_id, alliance_id, faction_id, name, sec_status from ew_characters where character_id = ? limit 1', req.params.id);
	if (info.length == 0) return { status_code: 404 } // 404;

	let history = await app.mysql.query('select record_id, corporation_id, date_format(start_date, "%Y/%m/%d %H:%i") start_date, date_format(end_date, "%Y/%m/%d %H:%i") end_date from ew_history where character_id = ?', req.params.id);

	return { json: { info: info, history: history }, ttl: 86400 };
}

async function getCorp(req, res) {
	const app = req.app.app;
	const pagination = getPagination(req);

	let info = await app.mysql.query('select corporation_id, name, memberCount from ew_corporations where is_npc_corp = 0 and corporation_id > 0 and corporation_id = ? limit 1', req.params.id);
	if (info.length == 0) return { status_code: 404 } // 404;

	let total = await getCachedTotal(app, 'corp_chars', req.params.id, 'select count(*) total from ew_characters where corporation_id = ?', req.params.id);
	pagination.total = total || 0;

	let characters = [];
	if (pagination.offset < pagination.total) {
		characters = await app.mysql.query('select character_id, name from ew_characters where corporation_id = ? order by name limit ? offset ?', [req.params.id, pagination.limit, pagination.offset]);
	}

	return { json: { info: info, characters: characters, pagination: formatPagination(pagination) }, ttl: 86400 };
}

async function getAlli(req, res) {
	const app = req.app.app;
	const pagination = getPagination(req);

	let info = await app.mysql.query('select alliance_id, name, memberCount from ew_alliances where alliance_id > 0 and alliance_id = ? limit 1', req.params.id);
	if (info.length == 0) return { status_code: 404 } // 404;

	let total = await getCachedTotal(app, 'alli_chars', req.params.id, 'select count(*) total from ew_characters where alliance_id = ?', req.params.id);
	pagination.total = total || 0;

	let characters = [];
	if (pagination.offset < pagination.total) {
		characters = await app.mysql.query('select character_id, name from ew_characters where alliance_id = ? order by name limit ? offset ?', [req.params.id, pagination.limit, pagination.offset]);
	}

	return { json: { info: info, characters: characters, pagination: formatPagination(pagination) }, ttl: 86400 };
}

async function getCorpDeparted(req, res) {
	const app = req.app.app;
	const pagination = getPagination(req);

	const info = await app.mysql.query('select corporation_id, name, memberCount from ew_corporations where is_npc_corp = 0 and corporation_id > 0 and corporation_id = ? limit 1', req.params.id);

	if (info.length == 0) return { status_code: 404 } // 404;

	let total = await getCachedTotal(app, 'corp_departed', req.params.id, 'select count(*) total from ew_history where end_date is not null and corporation_id = ?', req.params.id);
	pagination.total = total || 0;

	const query = 'select character_id id, date_format(start_date, "%Y/%m/%d %H:%i") start_date, date_format(end_date, "%Y/%m/%d %H:%i") end_date from ew_history where end_date is not null and corporation_id = ? order by end_date desc limit ? offset ?'

	let result = [];
	if (pagination.offset < pagination.total) {
		result = await app.mysql.query(query, [req.params.id, pagination.limit, pagination.offset])
	}

	return { json: { characters: result, pagination: formatPagination(pagination) }, ttl: 86400 };
}

async function getCorpJoined(req, res) {
	const app = req.app.app;
	const pagination = getPagination(req);

	const info = await app.mysql.query('select corporation_id, name, memberCount from ew_corporations where is_npc_corp = 0 and corporation_id > 0 and corporation_id = ? limit 1', req.params.id);

	if (info.length == 0) return { status_code: 404 } // 404;

	let total = await getCachedTotal(app, 'corp_joined', req.params.id, 'select count(*) total from ew_history where corporation_id = ?', req.params.id);
	pagination.total = total || 0;

	const query = 'select character_id id, date_format(start_date, "%Y/%m/%d %H:%i") start_date, date_format(end_date, "%Y/%m/%d %H:%i") end_date from ew_history where corporation_id = ? order by start_date desc limit ? offset ?'

	let result = [];
	if (pagination.offset < pagination.total) {
		result = await app.mysql.query(query, [req.params.id, pagination.limit, pagination.offset])
	}

	return { json: { characters: result, pagination: formatPagination(pagination) }, ttl: 86400 };
}

function getPagination(req) {
	const page = parsePositiveInt(req.params.page, 1);

	return {
		page: page,
		limit: PAGE_SIZE,
		offset: (page - 1) * PAGE_SIZE,
		total: 0
	};
}

function parsePositiveInt(value, fallback) {
	const parsed = parseInt(value, 10);
	if (!Number.isFinite(parsed) || parsed < 1) return fallback;
	return parsed;
}

async function getCachedTotal(app, type, id, sql, args) {
	const key = 'api:total:' + type + ':' + id;

	if (app.redis) {
		try {
			const cached = await app.redis.get(key);
			const total = parseInt(cached, 10);
			if (Number.isFinite(total)) return total;
		} catch (e) {
			console.error('Total cache read failed:', key, e.message);
		}
	}

	const total = await app.mysql.queryField('total', sql, args) || 0;

	if (app.redis) {
		try {
			await app.redis.setex(key, TOTAL_CACHE_TTL, String(total));
		} catch (e) {
			console.error('Total cache write failed:', key, e.message);
		}
	}

	return total;
}

function formatPagination(pagination) {
	const pages = Math.ceil(pagination.total / pagination.limit);

	return {
		page: pagination.page,
		limit: pagination.limit,
		total: pagination.total,
		pages: pages,
		has_next: pagination.page < pages,
		has_previous: pagination.page > 1
	};
}
