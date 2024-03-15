const accountCtrl = require('../controllers/accountCtrl');

function accountRoute(app) {
	app.get('/user', accountCtrl.getToken);
	app.get('/verify', accountCtrl.getVerify);
	app.post('/verify', accountCtrl.submitVerify);
	app.post('/reset', accountCtrl.resetPassword);
	app.post('/login', accountCtrl.login);
	app.post('/register', accountCtrl.register);
	app.post('/complete-register', accountCtrl.completeRegister);
	app.get('/profile', accountCtrl.getProfileUser);
	app.put('/profile', accountCtrl.modifyProfileUser);
	app.post('/check-password', accountCtrl.checkPassword);
	app.post('/change-password', accountCtrl.changePassword);
}

module.exports = accountRoute;
