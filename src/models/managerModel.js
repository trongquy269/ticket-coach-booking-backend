const db = require('../config/database.js');

function getAllGarage (callback) {
	db.query(
		`
			SELECT * FROM Garages
		`,
		callback,
	);
}

function getGarageByName (name, callback) {
	db.query(
		`
			SELECT * FROM Garages WHERE name = ?
		`,
		[name],
		callback,
	);
}

function addNewGarage ([name, description], callback) {
	db.query(
		`
			INSERT INTO Garages (name, description)
			VALUES (?, ?)
		`,
		[name, description],
		callback,
	);
}

function editGarage ([id, key, value], callback) {
	db.query(
		`
			UPDATE Garages
			SET ${key} = ?
			WHERE id = ?
		`,
		[value, id],
		callback,
	);
}

function removeGarage (id, callback) {
	db.query(
		`
			DELETE FROM Garages
			WHERE id = ?
		`,
		[id],
		callback,
	);
}

function getAllCoach (callback) {
	db.query(
		`
			SELECT c.id, c.vehicle_number, c.manufacturer, c.license_plates, c.number_seat, tc.name AS type, g.name AS garage
			FROM Coaches AS c, Type_Coaches as tc, Garages as g
			WHERE c.type_id = tc.id AND c.garage_id = g.id
		`,
		callback,
	);
}

function getCoachByVehicleNumber (licensePlate, callback) {
	db.query(
		`
			SELECT * FROM Coaches WHERE license_plates = ?
		`,
		[licensePlate],
		callback,
	);
}

function addNewCoach (
	[vehicleNumber, manufacturer, licensePlate, numberSeat, garageId, typeId],
	callback,
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
		callback,
	);
}

function editCoach ([id, key, value], callback) {
	db.query(
		`
			UPDATE Coaches
			SET ${key} = ?
			WHERE id = ?
		`,
		[value, id],
		callback,
	);
}

function removeCoach (id, callback) {
	db.query(
		`
			DELETE FROM Coaches
			WHERE id = ?
		`,
		[id],
		callback,
	);
}

function getAllUser (callback) {
	db.query(
		`
			SELECT u.id, u.name, u.gender, u.date_of_birth, u.phone, u.citizen_identification, u.email, u.point, d.name as district, c.name as city, a.username, a.creation_date, a.role
			FROM Users AS u
			LEFT JOIN Districts AS d ON u.district_id = d.id
			LEFT JOIN Cities AS c ON d.city_id = c.id
			LEFT JOIN Accounts AS a ON u.id = a.user_id;
		`,
		callback,
	);
}

function checkUserExist (phone, callback) {
	db.query(
		`
			SELECT * FROM Users WHERE phone = ?
		`,
		[phone],
		callback,
	);
}

function addNewUser (
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
	callback,
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
		callback,
	);
}

function checkUsernameIsPhone (phone, callback) {
	db.query(
		`
			SELECT * FROM Accounts WHERE username = ?
		`,
		phone,
		callback,
	);
}

function updateUsername ([newUsername, user_id], callback) {
	db.query(
		`
			UPDATE Accounts
			SET username = ?
			WHERE user_id = ?
		`,
		[newUsername, user_id],
		callback,
	);
}

function editUser ([phone, key, value], callback) {
	db.query(
		`
			UPDATE Users
			SET ${key} = ?
			WHERE phone = ?
		`,
		[value, phone],
		callback,
	);
}

function removeUserById (id, callback) {
	db.query(
		`
			DELETE FROM Accounts
			WHERE user_id = ?
		`,
		[id],
		(err, result) => {
			if (err) {
				return callback(err);
			}

			db.query(
				`
					DELETE FROM Accounts
					WHERE user_id = ?
				`,
				[id],
				callback,
			);
		},
	);
}

function getAllSchedule (callback) {
	db.query(
		`
			SELECT * FROM Schedules
		`,
		callback,
	);
}

function searchSuggestionUsers (searchData, callback) {
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
		callback,
	);
}

function searchUsers (searchData, callback) {
	db.query(
		`
			SELECT id, name, gender, date_of_birth, phone, email, citizen_identification
			FROM Users
			WHERE phone LIKE ?
				OR email LIKE ?
				OR citizen_identification LIKE ?
		`,
		[searchData + '%', searchData + '%', searchData + '%'],
		callback,
	);
}

function searchSuggestionTickets (searchData, callback) {
	db.query(
		`
			SELECT id
			FROM Tickets
			WHERE id LIKE ?
		`,
		searchData + '%',
		callback,
	);
}

function searchTickets (searchData, callback) {
	db.query(
		`
			SELECT Tickets.id, Users.name, Users.phone
			FROM Tickets
			JOIN Users ON Users.id = Tickets.user_id
			WHERE Tickets.id LIKE ?
		`,
		searchData + '%',
		callback,
	);
}

function getTicketById (ticketId, callback) {
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
		callback,
	);
}

function getAllNameGarage (callback) {
	db.query(
		`
			SELECT name
			FROM Garages
		`,
		callback,
	);
}

function getTicketParameter (timeInterval, startDate, endDate, callback) {
	let groupByClause;
	let selectFields = [];

	switch (timeInterval) {
		case 'daily':
			groupByClause = 'GROUP BY G.name, DATE(S.date)';
			selectFields.push('DATE(S.date) AS schedule_date');
			break;
		case 'weekly':
			groupByClause = 'GROUP BY G.name, YEAR(S.date), WEEK(S.date)';
			selectFields.push(
				'YEAR(S.date) AS year, WEEK(S.date) AS week_number',
			);
			break;
		case 'monthly':
			groupByClause = 'GROUP BY G.name, YEAR(S.date), MONTH(S.date)';
			selectFields.push(
				'YEAR(S.date) AS year, MONTH(S.date) AS month_number',
			);
			break;
		case 'quarterly':
			groupByClause = 'GROUP BY G.name, YEAR(S.date), QUARTER(S.date)';
			selectFields.push(
				'YEAR(S.date) AS year, QUARTER(S.date) AS quarter_number',
			);
			break;
		case 'yearly':
			groupByClause = 'GROUP BY G.name, YEAR(S.date)';
			selectFields.push('YEAR(S.date) AS year');
			break;
		default:
			throw new Error('Invalid interval');
	}

	// Common select fields
	selectFields.push(
		'G.name AS garage_name',
		'COUNT(DISTINCT S.id) AS number_of_schedules',
		'SUM(CASE WHEN T.isPaid = TRUE THEN 1 ELSE 0 END) AS tickets_sold',
	);

	db.query(
		`
			SELECT 
				${selectFields.join(', ')}
			FROM 
				Schedules S
			JOIN 
				Coaches C ON S.coach_id = C.id
			JOIN 
				Garages G ON C.garage_id = G.id
			LEFT JOIN 
				Tickets T ON S.id = T.schedule_id
			WHERE 
				S.date BETWEEN ? AND ?
			${groupByClause}
			ORDER BY 
				${timeInterval === 'daily' ? 'schedule_date' : 'year'}
    	`,
		[startDate, endDate],
		callback,
	);
}

function addNewAndGetStartPoint ([cityId, districtId], callback) {
	db.query(
		`
			INSERT INTO Start_point (city_id, district_id)
			VALUES (?, ?)
			ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id);

			SELECT LAST_INSERT_ID() AS id;
		`,
		[cityId, districtId],
		callback,
	);
}

function addNewAndGetEndPoint ([cityId, districtId], callback) {
	db.query(
		`
			INSERT INTO End_point (city_id, district_id)
			VALUES (?, ?)
			ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id);

			SELECT LAST_INSERT_ID() AS id;
		`,
		[cityId, districtId],
		callback,
	);
}

function addNewAndGetRoute ([startPointId, endPointId, distance, duration], callback) {
	db.query(
		`
			INSERT INTO Routes (start_id, end_id, distance, duration)
			VALUES (?, ?, ?, ?)
			ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id);

			SELECT LAST_INSERT_ID() AS id;
		`,
		[startPointId, endPointId, distance, duration],
		callback,
	);
}

function getTypeCoach (callback) {
	db.query(
		`
			SELECT id, name
			FROM Type_Coaches
		`,
		callback,
	);
}

function getSimpleCoach (userId, callback) {
	db.query(
		`
			SELECT c.id, c.vehicle_number, c.type_id
			FROM Garages AS g
			JOIN Coaches AS c ON c.garage_id = g.id
			WHERE g.user_id = ?
		`, userId, callback,
	);
}

function addNewSchedule ([routeId, date, time, price, discount, coachId], callback) {
	db.query(
		`
			INSERT INTO Schedules(route_id, date, time, price, discount, coach_id)
			VALUES (?, ?, ?, ?, ?, ?);
			
			SET @schedule_id = LAST_INSERT_ID();
			
			CALL AddSeats(@schedule_id, 'empty')
		`, [routeId, date, time, price, discount, coachId],
		callback,
	);
}

function getFiguresWithDay (date, callback) {
	db.query(
		`
			SELECT t.seat, t.back_seat, t.price, sbs.address, sbs.back_address, u.phone,
					sc.name AS start_place, ec.name AS end_place,
					s.time AS go_time, s.date AS go_date, sb.time AS back_time, sb.date AS back_date,
					t.time, t.date
			FROM Tickets AS t
			LEFT JOIN Schedules AS s ON s.id = t.schedule_id
			LEFT JOIN Schedules AS sb ON sb.id = t.schedule_back_id
			LEFT JOIN Routes AS r ON r.id = s.route_id
			LEFT JOIN Start_point AS sp ON sp.id = r.start_id
			LEFT JOIN End_point AS ep ON ep.id = r.end_id
			LEFT JOIN Cities AS sc ON sc.id = sp.city_id
			LEFT JOIN Cities AS ec ON ec.id = ep.city_id
			LEFT JOIN Shuttle_Bus AS sbs ON sbs.ticket_id = t.id
			LEFT JOIN Users AS u ON u.id = t.user_id
			WHERE t.date = ?
			ORDER BY t.time, t.date
		`, date,
		callback,
	);
}

function getFiguresManyDays ([from, to], callback) {
	db.query(
		`
			SELECT t.seat, t.back_seat, t.price, sbs.address, sbs.back_address, u.phone,
					sc.name AS start_place, ec.name AS end_place,
					s.time AS go_time, s.date AS go_date, sb.time AS back_time, sb.date AS back_date,
					t.time, t.date
			FROM Tickets AS t
			LEFT JOIN Schedules AS s ON s.id = t.schedule_id
			LEFT JOIN Schedules AS sb ON sb.id = t.schedule_back_id
			LEFT JOIN Routes AS r ON r.id = s.route_id
			LEFT JOIN Start_point AS sp ON sp.id = r.start_id
			LEFT JOIN End_point AS ep ON ep.id = r.end_id
			LEFT JOIN Cities AS sc ON sc.id = sp.city_id
			LEFT JOIN Cities AS ec ON ec.id = ep.city_id
			LEFT JOIN Shuttle_Bus AS sbs ON sbs.ticket_id = t.id
			LEFT JOIN Users AS u ON u.id = t.user_id
			WHERE t.date BETWEEN ? AND ?
			ORDER BY t.time, t.date
		`, [from, to],
		callback,
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
	getAllNameGarage,
	getTicketParameter,
	addNewAndGetStartPoint,
	getTypeCoach,
	getSimpleCoach,
	addNewAndGetEndPoint,
	addNewAndGetRoute,
	addNewSchedule,
	getFiguresWithDay,
	getFiguresManyDays,
};
