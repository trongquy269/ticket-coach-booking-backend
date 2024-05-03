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
			LEFT JOIN Accounts AS a ON u.id = a.user_id;
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

function searchSuggestionUsers(searchData, callback) {
	db.query(
		`
			SELECT CONCAT('phone-', phone) AS data
			FROM Users
			WHERE phone LIKE ?
			UNION
			SELECT CONCAT('citizen_identification-', citizen_identification) AS data
			FROM Users
			WHERE citizen_identification LIKE ?
			UNION
			SELECT CONCAT('email-', email) AS data
			FROM Users
			WHERE email LIKE ?
		`,
		[searchData + '%', searchData + '%', searchData + '%'],
		callback
	);
}

function searchUsers(searchData, callback) {
	db.query(
		`
			SELECT id, name, gender, date_of_birth, phone, email, citizen_identification
			FROM Users
			WHERE phone LIKE ?
				OR email LIKE ?
				OR citizen_identification LIKE ?
		`,
		[searchData + '%', searchData + '%', searchData + '%'],
		callback
	);
}

function searchSuggestionTickets(searchData, callback) {
	db.query(
		`
			SELECT id
			FROM Tickets
			WHERE id LIKE ?
		`,
		searchData + '%',
		callback
	);
}

function searchTickets(searchData, callback) {
	db.query(
		`
			SELECT Tickets.id, Users.name, Users.phone
			FROM Tickets
			JOIN Users ON Users.id = Tickets.user_id
			WHERE Tickets.id LIKE ?
		`,
		searchData + '%',
		callback
	);
}

function getTicketById(ticketId, callback) {
	db.query(
		`
			SELECT t.seat, t.payment, t.isPaid, t.time as ticket_time, t.date as ticket_date, t.discount, t.price, t.round_trip, u.name, u.phone, ct.name as start, ct2.name as end, s.time as time_start, s.date as date_start, r.distance, r.duration, c.vehicle_number, c.manufacturer, c.license_plates, c.number_seat, tc.name as type_coach, g.name as garage_name, s.price as original_price, sb.name as shuttle_bus_name, sb.phone_number as shuttle_bus_phone, sb.address as shuttle_bus_address
			FROM Tickets AS t
			JOIN Users AS u ON u.id = t.user_id
			JOIN Schedules AS s ON s.id = t.schedule_id
			JOIN Coaches AS c ON c.id = s.coach_id
			JOIN Type_Coaches AS tc ON tc.id = c.type_id
			JOIN Garages AS g ON g.id = c.garage_id
			JOIN Routes AS r ON r.id = s.route_id
			JOIN Start_point AS sp ON sp.id = r.start_id
			JOIN End_point AS ep ON ep.id = r.end_id
			JOIN Cities as ct ON ct.id = sp.city_id
			JOIN Cities as ct2 ON ct2.id = ep.city_id
			LEFT JOIN Shuttle_Bus as sb ON sb.ticket_id = t.id
			WHERE t.id = ?
		`,
		ticketId,
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
	searchSuggestionUsers,
	searchUsers,
	getTicketById,
	searchTickets,
	searchSuggestionTickets,
};
