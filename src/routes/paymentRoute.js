const paymentCtrl = require('../controllers/paymentCtrl');

function paymentRoute(app) {
	app.post('/createOnlinePayment', paymentCtrl.createOnlinePayment);
	app.post('/webhooks/square', paymentCtrl.squareResponse);
}

module.exports = paymentRoute;
