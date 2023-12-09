const db = require('../config/database.js');

function getAllGarage(callback) {
	db.query(
		`
			SELECT * FROM Garages
		`,
		callback
	);
}

function getGarageByName(name, callback) {
	db.query(
		`
			SELECT * FROM Garages WHERE name = ?
		`,
		[name],
		callback
	);
}

function addNewGarage([name, description], callback) {
	db.query(
		`
			INSERT INTO Garages (name, description)
			VALUES (?, ?)
		`,
		[name, description],
		callback
	);
}

function editGarage([id, key, value], callback) {
	db.query(
		`
			UPDATE Garages
			SET ${key} = ?
			WHERE id = ?
		`,
		[value, id],
		callback
	);
}

function removeGarage(id, callback) {
	db.query(
		`
			DELETE FROM Garages
			WHERE id = ?
		`,
		[id],
		callback
	);
}

function getAllCoach(callback) {
	db.query(
		`
			SELECT c.id, c.vehicle_number, c.manufacturer, c.license_plates, c.number_seat, tc.name AS type, g.name AS garage
			FROM Coaches AS c, Type_Coaches as tc, Garages as g
			WHERE c.type_id = tc.id AND c.garage_id = g.id
		`,
		callback
	);
}

function getCoachByVehicleNumber(licensePlate, callback) {
	db.query(
		`
			SELECT * FROM Coaches WHERE license_plates = ?
		`,
		[licensePlate],
		callback
	);
}

function addNewCoach(
	[vehicleNumber, manufacturer, licensePlate, numberSeat, garageId, typeId],
	callback
) {
	db.query(
		`
			INSERT INTO Coaches (vehicle_number, manufacturer, license_plates, number_seat, garage_id, type_id)
			VALUES (?, ?, ?, ?, ?, ?)
		`,
		[
			vehicleNumber,
			manufacturer,
			licensePlate,
			numberSeat,
			garageId,
			typeId,
		],
		callback
	);
}

function editCoach([id, key, value], callback) {
	db.query(
		`
			UPDATE Coaches
			SET ${key} = ?
			WHERE id = ?
		`,
		[value, id],
		callback
	);
}

function removeCoach(id, callback) {
	db.query(
		`
			DELETE FROM Coaches
			WHERE id = ?
		`,
		[id],
		callback
	);
}

function getAllUser(callback) {
	db.query(
		`
			SELECT u.id, u.name, u.gender, u.date_of_birth, u.phone, u.citizen_identification, u.email, u.point, d.name as district, c.name as city, a.username, a.creation_date, a.role
			FROM Users AS u
			LEFT JOIN Districts AS d ON u.district_id = d.id
			LEFT JOIN Cities AS c ON d.city_id = c.id
			JOIN Accounts AS a ON u.id = a.user_id;
		`,
		callback
	);
}

function checkUserExist(phone, callback) {
	db.query(
		`
			SELECT * FROM Users WHERE phone = ?
		`,
		[phone],
		callback
	);
}

function addNewUser(
	[
		name,
		gender,
		dateOfBirth,
		email,
		phone,
		citizenIdentification,
		city,
		district,
		username,
		passwordHashed,
	],
	callback
) {
	db.query(
		`
			CALL AddNewUserProcedure(?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
		`,
		[
			name,
			gender,
			dateOfBirth,
			email,
			phone,
			citizenIdentification,
			city,
			district,
			username,
			passwordHashed,
		],
		callback
	);
}

function checkUsernameIsPhone(phone, callback) {
	db.query(
		`
			SELECT * FROM Accounts WHERE username = ?
		`,
		phone,
		callback
	);
}

function updateUsername([newUsername, user_id], callback) {
	db.query(
		`
			UPDATE Accounts
			SET username = ?
			WHERE user_id = ?
		`,
		[newUsername, user_id],
		callback
	);
}

function editUser([phone, key, value], callback) {
	db.query(
		`
			UPDATE Users
			SET ${key} = ?
			WHERE phone = ?
		`,
		[value, phone],
		callback
	);
}

function removeUserById(id, callback) {
	db.query(
		`
			DELETE FROM Accounts
			WHERE user_id = ?
		`,
		[id],
		(err, result) => {
			if (err) return callback(err);

			db.query(
				`
					DELETE FROM Accounts
					WHERE user_id = ?
				`,
				[id],
				callback
			);
		}
	);
}

function getAllSchedule(callback) {
	db.query(
		`
			SELECT * FROM Schedules
		`,
		callback
	);
}

module.exports = {
	getAllGarage,
	addNewGarage,
	getGarageByName,
	editGarage,
	removeGarage,
	getAllCoach,
	getCoachByVehicleNumber,
	addNewCoach,
	editCoach,
	removeCoach,
	getAllUser,
	checkUserExist,
	addNewUser,
	editUser,
	checkUsernameIsPhone,
	updateUsername,
	removeUserById,
	getAllSchedule,
};
