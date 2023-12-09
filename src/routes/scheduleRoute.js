const scheduleCtrl = require('../controllers/scheduleCtrl');

function scheduleRoute(app) {
	app.get('/schedule', scheduleCtrl.getSchedule);
	app.post('/schedule', scheduleCtrl.viewSchedule);
	app.get('/booking', scheduleCtrl.getTicket);
	app.post('/booking', scheduleCtrl.bookSchedule);
	app.delete('/booking', scheduleCtrl.cancelTicket);
	app.get('/my-schedule', scheduleCtrl.getMySchedule);
}

module.exports = scheduleRoute;
