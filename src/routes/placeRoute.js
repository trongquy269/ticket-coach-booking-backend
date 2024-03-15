const placeCtrl = require('../controllers/placeCtrl');

function placeRoute(app) {
	app.get('/city', placeCtrl.getPlaces);
	app.get('/district', placeCtrl.getDistrict);
	app.get('/start-point', placeCtrl.getStartPoint);
	app.get('/end-point', placeCtrl.getEndPoint);
}

module.exports = placeRoute;
