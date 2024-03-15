const scheduleCtrl = require('../controllers/scheduleCtrl');

function scheduleRoute(app) {
	app.get('/schedule', scheduleCtrl.getSchedule);
	app.post('/schedule', scheduleCtrl.viewSchedule);
	app.get('/booking', scheduleCtrl.getTicket);
	app.post('/booking', scheduleCtrl.bookSchedule);
	app.delete('/booking', scheduleCtrl.cancelTicket);
	app.get('/my-schedule', scheduleCtrl.getMySchedule);
	app.get('/feedback', scheduleCtrl.getFeedback);
	app.post('/feedback', scheduleCtrl.sendFeedback);
	app.put('/feedback', scheduleCtrl.changeFeedback);
	app.get('/reply-feedback', scheduleCtrl.getReplyFeedback);
	app.post('/reply-feedback', scheduleCtrl.sendReplyFeedback);
	app.put('/reply-feedback', scheduleCtrl.changeReplyFeedback);
}

module.exports = scheduleRoute;
