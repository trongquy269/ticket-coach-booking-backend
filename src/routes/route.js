const account = require('./accountRoute.js');
const place = require('./placeRoute.js');
const schedule = require('./scheduleRoute.js');
const manager = require('./managerRoute.js');
const notify = require('./notifyRoute.js');
const chat = require('./chatRoute.js');
const payment = require('./paymentRoute.js');

function route(app) {
	account(app);
	place(app);
	schedule(app);
	manager(app);
	notify(app);
	chat(app);
	payment(app);
}

module.exports = route;
