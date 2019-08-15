module.exports = getData;

async function getData(req, res) {
  req.params.id = parseInt(req.params.id);


  const o = {};
  const details = await req.app.mysql.query('select * from ew_alliances where alliance_id = ?', req.params.id);
  o.details = details[0];
  o.corporations = await req.app.mysql.query('select corporation_id id, name, memberCount, diff from ew_corporations where alliance_id = ? order by name', req.params.id);
  o.details.corp_count = o.corporations.length

  if (o.details.memberCount > 0 && o.details.executor_corp > 1) {
    const exec_corp = await req.app.mysql.query('select corporation_id, name from ew_corporations where corporation_id = ?', o.details.executor_corp);
    if (exec_corp.length) o.details.exec_corp_name = exec_corp[0].name;
  }

  o.title = o.details.name;
  
  return o;
}
