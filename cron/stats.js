module.exports = {
    exec: f,
    span: 28800
}

async function f(app) {
    const stats = await app.mysql.queryRow(`
        select
            (select count(*) from ew_alliances) alliance_count,
            (select count(*) from ew_corporations) corporation_count,
            (select count(*) from ew_characters) character_count,
            (select count(*) from ew_corporations where is_npc_corp = 0) player_corporation_count,
            (select count(*) from ew_corporations where is_npc_corp = 1) npc_corporation_count,
            (select count(*) from ew_corporations where is_npc_corp = 0 and alliance_id != 0) allied_corporation_count,
            (select count(*) from ew_corporations where is_npc_corp = 0 and alliance_id = 0) independent_corporation_count,
            (select count(*) from ew_corporations where is_npc_corp = 0 and active != 0) active_corporation_count,
            (select count(*) from ew_corporations where is_npc_corp = 0 and active = 0) inactive_corporation_count,
            (select count(*) from ew_corporations where is_npc_corp = 0 and memberCount > 0) non_empty_corporation_count,
            (select count(*) from ew_corporations where is_npc_corp = 0 and memberCount = 0) empty_corporation_count,
            (select count(*) from ew_alliances where corp_count > 0) populated_alliance_count,
            (select count(*) from ew_alliances where corp_count = 0) empty_alliance_count,
            (select count(*) from ew_alliances where faction_id != 0) faction_alliance_count,
            (select count(*) from ew_characters where alliance_id != 0) characters_in_alliances_count,
            (select count(*) from ew_characters where alliance_id = 0) unaffiliated_character_count,
            (select count(*) from ew_characters where faction_id != 0) faction_character_count,
            (select count(*) from ew_corporations where is_npc_corp = 0 and faction_id != 0) faction_corporation_count,
            (select count(*) from ew_characters ch left join ew_corporations corp on corp.corporation_id = ch.corporation_id where corp.is_npc_corp = 1) characters_in_npc_corporations_count,
            (select count(*) from ew_characters ch left join ew_corporations corp on corp.corporation_id = ch.corporation_id where corp.is_npc_corp = 0) characters_in_non_npc_corporations_count,
            (select count(*) from ew_characters ch left join ew_corporations corp on corp.corporation_id = ch.corporation_id where corp.is_npc_corp = 0 and corp.faction_id != 0) characters_in_faction_corporations_count,
            (select count(*) from ew_characters ch left join ew_alliances al on al.alliance_id = ch.alliance_id where al.faction_id != 0) characters_in_faction_alliances_count,
            (select avg(y.alliance_activity) from (select avg(c.active) alliance_activity from ew_corporations c where c.is_npc_corp = 0 and c.alliance_id != 0 group by c.alliance_id) y) alliance_activity_score,
            (select count(*) from ew_characters where history_added = 1) history_complete_count,
            (select count(*) from ew_characters where history_added = 0) history_pending_count,
            (select count(*) from ew_characters where recent_change = 1) recent_change_count,
            (select avg(memberCount) from ew_corporations where is_npc_corp = 0) avg_player_corporation_members,
            (select avg(memberCount) from ew_alliances where corp_count > 0) avg_alliance_members,
            (select corporation_id from ew_corporations where is_npc_corp = 0 order by memberCount desc, name asc limit 1) largest_corporation_id,
            (select name from ew_corporations where is_npc_corp = 0 order by memberCount desc, name asc limit 1) largest_corporation_name,
            (select memberCount from ew_corporations where is_npc_corp = 0 order by memberCount desc, name asc limit 1) largest_corporation_members,
            (select alliance_id from ew_alliances order by memberCount desc, name asc limit 1) largest_alliance_id,
            (select name from ew_alliances order by memberCount desc, name asc limit 1) largest_alliance_name,
            (select memberCount from ew_alliances order by memberCount desc, name asc limit 1) largest_alliance_members
    `);

    const payload = {
        title: 'Stats',
        generated_at: new Date().toISOString(),
        refresh_interval_hours: 8,
        alliance_count: stats.alliance_count || 0,
        corporation_count: stats.corporation_count || 0,
        character_count: stats.character_count || 0,
        player_corporation_count: stats.player_corporation_count || 0,
        npc_corporation_count: stats.npc_corporation_count || 0,
        allied_corporation_count: stats.allied_corporation_count || 0,
        independent_corporation_count: stats.independent_corporation_count || 0,
        active_corporation_count: stats.active_corporation_count || 0,
        inactive_corporation_count: stats.inactive_corporation_count || 0,
        non_empty_corporation_count: stats.non_empty_corporation_count || 0,
        empty_corporation_count: stats.empty_corporation_count || 0,
        populated_alliance_count: stats.populated_alliance_count || 0,
        empty_alliance_count: stats.empty_alliance_count || 0,
        faction_alliance_count: stats.faction_alliance_count || 0,
        characters_in_alliances_count: stats.characters_in_alliances_count || 0,
        unaffiliated_character_count: stats.unaffiliated_character_count || 0,
        faction_character_count: stats.faction_character_count || 0,
        faction_corporation_count: stats.faction_corporation_count || 0,
        characters_in_npc_corporations_count: stats.characters_in_npc_corporations_count || 0,
        characters_in_non_npc_corporations_count: stats.characters_in_non_npc_corporations_count || 0,
        characters_in_faction_corporations_count: stats.characters_in_faction_corporations_count || 0,
        characters_in_faction_alliances_count: stats.characters_in_faction_alliances_count || 0,
        alliance_activity_score: Number(stats.alliance_activity_score || 0),
        history_complete_count: stats.history_complete_count || 0,
        history_pending_count: stats.history_pending_count || 0,
        recent_change_count: stats.recent_change_count || 0,
        avg_player_corporation_members: Number(stats.avg_player_corporation_members || 0),
        avg_alliance_members: Number(stats.avg_alliance_members || 0),
        largest_corporation_id: stats.largest_corporation_id || 0,
        largest_corporation_name: stats.largest_corporation_name || 'N/A',
        largest_corporation_members: stats.largest_corporation_members || 0,
        largest_alliance_id: stats.largest_alliance_id || 0,
        largest_alliance_name: stats.largest_alliance_name || 'N/A',
        largest_alliance_members: stats.largest_alliance_members || 0
	};
	
	console.log('[' + new Date().toISOString() + '] Stats generated');

    await app.redis.set('stats:summary', JSON.stringify(payload));
}