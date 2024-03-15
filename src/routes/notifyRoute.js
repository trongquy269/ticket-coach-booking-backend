const notifyCtrl = require('../controllers/notifyCtrl');

function notifyRoute(app) {
	app.get('/notify', notifyCtrl.getNotifies);
	app.put('/notify', notifyCtrl.changeState);
	app.patch('/notify', notifyCtrl.seenHandler);
	app.delete('/notify', notifyCtrl.deleteNotifies);
	app.post('/notify/undo', notifyCtrl.undo);
}

module.exports = notifyRoute;
