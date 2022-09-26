'use strict';

function isDowntime() {
    var time = new Date();
    var min = time.getMinutes();
    var hour = ('0' + time.getHours()).substr(-2);
    var hi = hour + min;
    return (hi >= '1055' && hi <= '1130');
}

module.exports = isDowntime;