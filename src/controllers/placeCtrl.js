const placeModel = require('../models/placeModel');

function getPlaces(req, res) {
	placeModel.getAllCities((err, result) => {
		if (err) throw err;

		if (result.length === 0) return res.status(404).send('No cities found');
		res.status(200).send(result);
	});
}

function getDistrict(req, res) {
	const city = req.query.city;

	placeModel.getDistrict(city, (err, result) => {
		if (err) throw err;

		if (result.length === 0)
			return res.status(404).send('No districts found');
		res.status(200).send(result);
	});
}

function getStartPoint(req, res) {
	placeModel.getStartPoint((err, result) => {
		if (err) throw err;

		if (result.length === 0)
			return res.status(404).send('No start points found');
		res.status(200).send(result);
	});
}

function getEndPoint(req, res) {
	placeModel.getEndPoint((err, result) => {
		if (err) throw err;

		if (result.length === 0)
			return res.status(404).send('No end points found');
		res.status(200).send(result);
	});
}

module.exports = {
	getPlaces,
	getDistrict,
	getStartPoint,
	getEndPoint,
};
