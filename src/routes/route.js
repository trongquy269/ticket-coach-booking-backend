const account = require('./accountRoute.js');
const place = require('./placeRoute.js');
const schedule = require('./scheduleRoute.js');
const manager = require('./managerRoute.js');
const notify = require('./notifyRoute.js');
const chat = require('./chatRoute.js');

function route(app) {
	account(app);
	place(app);
	schedule(app);
	manager(app);
	notify(app);
	chat(app);
}

module.exports = route;
