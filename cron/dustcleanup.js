module.exports = {
    exec: dustcleanup,
    span: -1
}

async function dustcleanup(app) {
    let mysql = app.mysql;

    await mysql.query('delete from ew_characters where name like "caldari dustcitizen %" limit 1');
    await mysql.query('delete from ew_characters where name like "amarr dustcitizen %" limit 1');
    await mysql.query('delete from ew_characters where name like "gallente dustcitizen %" limit 1');
    await mysql.query('delete from ew_characters where name like "minmatar dustcitizen %" limit 1');
}
