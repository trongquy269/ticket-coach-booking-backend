const accountCtrl = require('../controllers/accountCtrl');

function accountRoute(app) {
	app.get('/user', accountCtrl.getToken);
	app.get('/verify', accountCtrl.getVerify);
	app.post('/verify', accountCtrl.submitVerify);
	app.post('/reset', accountCtrl.resetPassword);
	app.post('/login', accountCtrl.login);
	app.post('/register', accountCtrl.register);
	app.post('/complete-register', accountCtrl.completeRegister);
}

module.exports = accountRoute;
