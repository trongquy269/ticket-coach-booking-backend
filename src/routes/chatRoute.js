const chatCtrl = require('../controllers/chatCtrl');

function chatRoute(app) {
	app.get('/chat', chatCtrl.getChat);
	app.post('/chat', chatCtrl.sendChat);
}

module.exports = chatRoute;
