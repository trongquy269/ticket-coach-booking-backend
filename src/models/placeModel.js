const db = require('../config/database.js');

function getAllCities (callback) {
	db.query(
		`
		SELECT *
		FROM Cities
		`,
		callback,
	);
}

function getDistrict (city, callback) {
	db.query(
		`
		SELECT Districts.name, Districts.id
		FROM Districts
		INNER JOIN Cities ON Districts.city_id = Cities.id
		WHERE Cities.name = ?
		`,
		city,
		callback,
	);
}

function getStartPoint (callback) {
	db.query(
		`
		SELECT Start_point.id, Cities.name
		FROM Start_point, Cities
		WHERE Start_point.city_id = Cities.id
		`,
		callback,
	);
}

function getEndPoint (callback) {
	db.query(
		`
		SELECT End_point.id, Cities.name
		FROM End_point, Cities
		WHERE End_point.city_id = Cities.id
		`,
		callback,
	);
}

function getEndPointByStartPoint (startPointId, callback) {
	db.query(
		`
			SELECT End_point.id, Cities.name
			FROM Routes
			JOIN Start_point ON Start_point.id = start_id
			JOIN End_point ON End_point.id = end_id
			JOIN Cities ON Cities.id = End_point.city_id
			WHERE Routes.start_id = ?
		`,
		startPointId,
		callback,
	);
}

function getAllRoutes (callback) {
	db.query(
		`
			SELECT r.id, cs.name AS start_place, ce.name AS end_place
			FROM Routes AS r
			JOIN Start_point AS sp ON sp.id = r.start_id
			JOIN End_point AS ep ON ep.id = r.end_id
			JOIN Cities AS cs ON cs.id = sp.city_id
			JOIN Cities AS ce ON ce.id = ep.city_id
		`,
		callback,
	);
}

module.exports = {
	getAllCities,
	getDistrict,
	getStartPoint,
	getEndPoint,
	getEndPointByStartPoint,
	getAllRoutes,
};
