const db = require('../config/database.js');

function getAllCities(callback) {
	db.query(
		`
		SELECT *
		FROM Cities
		`,
		callback
	);
}

function getDistrict(city, callback) {
	db.query(
		`
		SELECT Districts.name, Districts.id
		FROM Districts
		INNER JOIN Cities ON Districts.city_id = Cities.id
		WHERE Cities.name = ?
		`,
		city,
		callback
	);
}

function getStartPoint(callback) {
	db.query(
		`
		SELECT Start_point.id, Cities.name
		FROM Start_point, Cities
		WHERE Start_point.city_id = Cities.id
		`,
		callback
	);
}

function getEndPoint(callback) {
	db.query(
		`
		SELECT End_point.id, Cities.name
		FROM End_point, Cities
		WHERE End_point.city_id = Cities.id
		`,
		callback
	);
}

module.exports = {
	getAllCities,
	getDistrict,
	getStartPoint,
	getEndPoint,
};
