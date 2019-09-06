module.exports = f;

async function f(app) {
    setRedisResult(app, 'home:big_alliances', "select alliance_id id, name, memberCount, diff from ew_alliances order by memberCount desc limit 10");
    setRedisResult(app, 'home:growing_alliances', "select alliance_id id, name, memberCount, diff from ew_alliances order by diff desc limit 10");
    setRedisResult(app, 'home:shrinking_alliances', "select alliance_id id, name, memberCount, diff from ew_alliances order by diff limit 10");

    setRedisResult(app, 'home:big_corporations', "select corporation_id id, name, memberCount, diff from ew_corporations where alliance_id = 0 and is_npc_corp = 0 and active != 0 order by memberCount desc limit 10");
    setRedisResult(app, 'home:growing_corporations', "select corporation_id id, name, memberCount, diff from ew_corporations where is_npc_corp = 0 and alliance_id = 0 order by diff desc limit 10");
    setRedisResult(app, 'home:shrinking_corporations', "select corporation_id id, name, memberCount, diff from ew_corporations where is_npc_corp = 0 and alliance_id = 0 order by diff limit 10");

    setRedisResult(app, 'corp:top_member_count1', "select corporation_id id, name, memberCount, diff from ew_corporations where alliance_id = 0 and is_npc_corp = 0 and active != 0 order by memberCount desc limit 10");
    setRedisResult(app, 'corp:top_member_count2', "select corporation_id id, name, memberCount, diff from ew_corporations where alliance_id != 0 and is_npc_corp = 0 and active != 0 order by memberCount desc limit 10");
    setRedisResult(app, 'corp:highest_activity1', "select corporation_id id, name, memberCount, diff from ew_corporations where alliance_id = 0 and is_npc_corp = 0 and memberCount > 25 order by (log(memberCount) * log(active)) desc, diff desc, memberCount, name limit 10");
    setRedisResult(app, 'corp:highest_activity2', "select corporation_id id, name, memberCount, diff from ew_corporations where alliance_id != 0 and is_npc_corp = 0 and memberCount > 25 order by (log(memberCount) * log(active)) desc, diff desc, memberCount, name limit 10");
    setRedisResult(app, 'corp:pirate_corporations1', "select corporation_id id, name, memberCount, avg_sec_status from ew_corporations where memberCount != 0 and alliance_id = 0 and corporation_id > 1000200 and active != 0 order by avg_sec_status * log(memberCount) limit 10");
    setRedisResult(app, 'corp:pirate_corporations2', "select corporation_id id, name, memberCount, avg_sec_status from ew_corporations where memberCount != 0 and alliance_id != 0 and active != 0 order by avg_sec_status * log(memberCount) limit 10");
    setRedisResult(app, 'corp:carebear_corporations1', "select corporation_id id, name, memberCount, avg_sec_status from ew_corporations where memberCount != 0 and alliance_id = 0 and corporation_id > 1000200 and active != 0 order by avg_sec_status * log(memberCount) desc limit 10");
    setRedisResult(app, 'corp:carebear_corporations2', "select corporation_id id, name, memberCount, avg_sec_status from ew_corporations where memberCount != 0 and alliance_id != 0 and active != 0 order by avg_sec_status * log(memberCount) desc limit 10");
    setRedisResult(app, 'corp:newest_25_members1', "select corporation_id id, name, memberCount, diff from ew_corporations where memberCount > 25 and is_npc_corp = 0 and alliance_id = 0 and corporation_id < 99965262 order by corporation_id desc limit 10");
    setRedisResult(app, 'corp:newest_25_members2', "select corporation_id id, name, memberCount, diff from ew_corporations where memberCount > 25 and is_npc_corp = 0 and alliance_id != 0 and corporation_id < 99965262 order by corporation_id desc limit 10");
    setRedisResult(app, 'corp:newest_recruiting1', "select corporation_id id, name, memberCount, diff from ew_corporations where memberCount > 25 and is_npc_corp = 0 and alliance_id = 0 and diff > 5 and corporation_id < 99965262 order by corporation_id desc limit 10");
    setRedisResult(app, 'corp:newest_recruiting2', "select corporation_id id, name, memberCount, diff from ew_corporations where memberCount > 25 and is_npc_corp = 0 and alliance_id != 0 and diff > 5 and corporation_id < 99965262 order by corporation_id desc limit 10");
    setRedisResult(app, 'corp:growing_corporations1', "select corporation_id id, name, memberCount, diff from ew_corporations where is_npc_corp = 0 and alliance_id = 0 order by diff desc limit 10");
    setRedisResult(app, 'corp:growing_corporations2', "select corporation_id id, name, memberCount, diff from ew_corporations where is_npc_corp = 0 and alliance_id != 0 order by diff desc limit 10");
    setRedisResult(app, 'corp:shrinking_corporations1',  "select corporation_id id, name, memberCount, diff from ew_corporations where is_npc_corp = 0 and alliance_id = 0 order by diff limit 10");
    setRedisResult(app, 'corp:shrinking_corporations2', "select corporation_id id, name, memberCount, diff from ew_corporations where is_npc_corp = 0 and alliance_id != 0 order by diff limit 10");
    //echo "\n";

    setRedisResult(app, 'alli:most_corporations', "select alliance_id id, name, corp_count memberCount, diff from ew_alliances order by corp_count desc limit 10");
    setRedisResult(app, 'alli:top_10_alliances', "select alliance_id id, name, memberCount, diff from ew_alliances order by memberCount desc limit 10");
    setRedisResult(app, 'alli:shrinking_alliances', "select alliance_id id, name, memberCount, diff from ew_alliances order by diff limit 10");
    setRedisResult(app, 'alli:growing_alliances', "select alliance_id id, name, memberCount, diff from ew_alliances order by diff desc limit 10");
    setRedisResult(app, 'alli:pirate_alliances', "select alliance_id id, name, memberCount, avg_sec_status from ew_alliances where memberCount != 0 order by avg_sec_status * log(memberCount) limit 10");
    setRedisResult(app, 'alli:carebear_alliances', "select alliance_id id, name, memberCount, avg_sec_status from ew_alliances where memberCount != 0 order by avg_sec_status * log(memberCount) desc limit 10");
    setRedisResult(app, 'alli:dead_alliances', "select alliance_id id, name, 0 corp_count, diff from ew_alliances where (memberCount = 0 or corp_count = 0) order by diff limit 10");
    setRedisResult(app, 'alli:newest_alliances', "select alliance_id id, name, memberCount, diff from ew_alliances where alliance_id < 99990000 and corp_count > 0 order by alliance_id desc limit 10");

    setTimeout(function() { f(app); }, 900000);
    console.log('home done...');
}

async function setRedisResult(app, key, query) {
    try {
        let result = await app.mysql.query(query);
        await app.redis.set(key, JSON.stringify(result));
    } catch (e) { 
        console.log(e);
        console.log(query);

    }
}
