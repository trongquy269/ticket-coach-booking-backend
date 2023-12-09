const account = require('./accountRoute.js');
const place = require('./placeRoute.js');
const schedule = require('./scheduleRoute.js');
const manager = require('./managerRoute.js');

function route(app) {
	account(app);
	place(app);
	schedule(app);
	manager(app);
}

module.exports = route;
