const db = require('../config/database.js');

function getSchedule([startPlace, endPlace, startDate], callback) {
	db.query(
		`
		SELECT 
			sch.id AS schedule_id,
			sch.time,
			sch.date,
			sch.price,
			sch.discount,
			spl.name AS start_place,
			epl.name AS end_place,
			r.distance,
			r.duration,
			co.vehicle_number,
			co.license_plates,
			co.number_seat,
			g.name as garage_name,
			tc.name as type_coach,
			(
				SELECT count(*)
				FROM Seats s
				WHERE s.schedule_id = sch.id AND s.state = 'empty'
			) as empty_seats
		FROM Routes r
		JOIN Schedules sch ON r.id = sch.route_id
		JOIN Coaches co ON sch.coach_id = co.id
		JOIN Garages g ON co.garage_id = g.id
		JOIN Type_Coaches tc ON co.type_id = tc.id
		JOIN Start_point s ON r.start_id = s.id
		JOIN End_point e ON r.end_id = e.id
		JOIN Cities spl ON s.city_id = spl.id
		JOIN Cities epl ON e.city_id = epl.id
		WHERE 
			r.start_id = ?
			AND r.end_id = ?
			AND sch.date = ?
		`,
		[startPlace, endPlace, startDate],
		callback
	);
}

function getScheduleByID(id, callback) {
	db.query(
		`
		SELECT 
			sch.id AS schedule_id,
			sch.time,
			sch.date,
			spl.name AS start_place,
			epl.name AS end_place,
			sch.price,
			sch.discount,
			r.distance,
			r.duration,
			co.vehicle_number,
			co.license_plates,
			co.number_seat,
			g.name as garage_name,
			tc.name as type_coach
		FROM Routes r
		JOIN Schedules sch ON r.id = sch.route_id
		JOIN Coaches co ON sch.coach_id = co.id
		JOIN Garages g ON co.garage_id = g.id
		JOIN Type_Coaches tc ON co.type_id = tc.id
		JOIN Start_point s ON r.start_id = s.id
		JOIN End_point e ON r.end_id = e.id
		JOIN Cities spl ON s.city_id = spl.id
		JOIN Cities epl ON e.city_id = epl.id
		WHERE sch.id = ?;
		`,
		id,
		callback
	);
}

function getSeatByScheduleID(scheduleID, callback) {
	db.query(
		`
		SELECT number, state
		FROM Seats
		WHERE schedule_id = ?
		`,
		scheduleID,
		callback
	);
}

function addTicket(
	[
		userId,
		scheduleId,
		scheduleBackId,
		seats,
		back_seats,
		payment,
		price,
		isPaid,
		discount,
		roundTrip,
	],
	callback
) {
	db.query(
		`
		INSERT INTO Tickets (user_id, schedule_id, schedule_back_id, seat, back_seat, payment, isPaid, time, date, discount, price, round_trip)
		VALUES (?, ?, ?, ?, ?, ?, ?, current_time(), current_date(), ?, ?, ?)
		`,
		[
			userId,
			scheduleId,
			scheduleBackId,
			seats,
			back_seats,
			payment,
			isPaid,
			discount,
			price,
			roundTrip,
		],
		callback
	);

	db.query(
		`
			CALL AddNewNotifyForSchedule(?, ?, ${isPaid}, ?)
		`,
		[userId, scheduleId, price]
	);

	if (scheduleBackId) {
		db.query(
			`
			CALL AddNewNotifyForSchedule(?, ?, ${isPaid}, ?)
		`,
			[userId, scheduleBackId, price]
		);
	}
}

function addTicketWithShuttleBus(
	[
		userId,
		scheduleId,
		scheduleBackId,
		seats,
		back_seats,
		payment,
		price,
		isPaid,
		discount,
		roundTrip,
		shuttleBusName,
		shuttleBusPhone,
		shuttleBusAddress,
		backShuttleBusName,
		backShuttleBusPhone,
		backShuttleBusAddress,
	],
	callback
) {
	db.query(
		`
			CALL BookTicketWithShuttleBus(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`,
		[
			userId,
			scheduleId,
			scheduleBackId,
			seats,
			back_seats,
			payment,
			isPaid,
			discount,
			price,
			roundTrip,
			shuttleBusName,
			shuttleBusPhone,
			shuttleBusAddress,
			backShuttleBusName,
			backShuttleBusPhone,
			backShuttleBusAddress,
		],
		callback
	);

	db.query(
		`
			CALL AddNewNotifyForSchedule(?, ?, ${isPaid}, ?)
		`,
		[userId, scheduleId, price]
	);

	if (scheduleBackId) {
		db.query(
			`
			CALL AddNewNotifyForSchedule(?, ?, ${isPaid}, ?)
		`,
			[userId, scheduleBackId, price]
		);
	}
}

function increasePoint(userId, callback) {
	db.query(
		`
			UPDATE Users
			SET point = point + 1
			WHERE id = ?
		`,
		userId,
		callback
	);
}

function bookSeat([scheduleID, seat], callback) {
	db.query(
		`
		UPDATE Seats
		SET state = 'full'
		WHERE schedule_id = ? AND number = ?
		`,
		[scheduleID, seat],
		callback
	);
}

function getTicket([userId, scheduleId], callback) {
	db.query(
		`
		SELECT id, seat, payment
		FROM Tickets
		WHERE user_id = ? AND schedule_id = ?
		`,
		[userId, scheduleId],
		callback
	);
}

function getScheduleIdByTicketId(ticketId, callback) {
	db.query(
		`
			SELECT schedule_id, schedule_back_id
			FROM Tickets
			WHERE id = ?
		`,
		ticketId,
		callback
	);
}

function cancelTicket([userId, scheduleId], callback) {
	db.query(
		`
			DELETE FROM Tickets
			WHERE user_id = ? AND schedule_id = ?
		`,
		[userId, scheduleId],
		callback
	);
}

function cancelSeat([scheduleID, seat], callback) {
	db.query(
		`
		UPDATE Seats
		SET state = 'empty'
		WHERE schedule_id = ? AND number = ?
		`,
		[scheduleID, seat],
		callback
	);
}

function getTicketByUserId(userId, callback) {
	db.query(
		`
		SELECT Tickets.*, Schedules.date as start_date
		FROM Tickets
		JOIN Schedules ON Tickets.schedule_id = Schedules.id
		WHERE Tickets.user_id = ?
		`,
		userId,
		callback
	);
}

function getFeedback(scheduleId, callback) {
	db.query(
		`
			SELECT f.id, f.content, f.rate, f.time, f.date, f.isModify, f.helpful, f.dislike, u.name, f.user_id, r.id as reply_feedback_id, r.content as reply_feedback_content, r.time as reply_feedback_time, r.date as reply_feedback_date, r.isModify as reply_feedback_isModify, g.name as garage_name, g.user_id as garage_id
			FROM Feedbacks f
			JOIN Users u ON f.user_id = u.id
			LEFT JOIN Reply_Feedbacks r ON r.feedback_id = f.id
			JOIN Schedules s ON f.schedule_id = s.id
			JOIN Coaches c ON s.coach_id = c.id
			JOIN Garages g ON c.garage_id = g.id
			WHERE f.schedule_id = ?
		`,
		scheduleId,
		callback
	);
}

function addNewFeedback([userId, scheduleId, rate, content], callback) {
	db.query(
		`
			CALL AddNewFeedback(?, ?, ?, ?)
		`,
		[userId, scheduleId, rate, content],
		callback
	);
}

function modifyFeedback([feedbackId, rate, content], callback) {
	db.query(
		`
			UPDATE Feedbacks
			SET rate = ?, content = ?, isModify = 1
			WHERE id = ?
		`,
		[rate, content, feedbackId],
		callback
	);
}

function addNewReplyFeedback([feedbackId, content], callback) {
	db.query(
		`
			CALL AddNewReplyFeedback(?, ?)
		`,
		[feedbackId, content],
		callback
	);
}

function modifyReplyFeedback([feedbackId, content], callback) {
	db.query(
		`
            UPDATE Reply_Feedbacks
            SET content = ?, isModify = 1
            WHERE id = ?
        `,
		[content, feedbackId],
		callback
	);
}

function getShuttleBus([ticketId], callback) {
	db.query(
		`
			SELECT name, phone_number, address, back_name, back_phone_number, back_address
			FROM Shuttle_Bus
			WHERE ticket_id = ?
		`,
		[ticketId],
		callback
	);
}

function addNewShuttleBus(
	[
		ticketId,
		name,
		phoneNumber,
		address,
		back_name,
		back_phoneNumber,
		back_address,
	],
	callback
) {
	db.query(
		`
			INSERT INTO Shuttle_Bus (ticket_id, name, phone_number, address, back_name, back_phone_number, back_address)
			VALUES (?, ?, ?, ?, ?, ?, ?)
		`,
		[
			ticketId,
			name,
			phoneNumber,
			address,
			back_name,
			back_phoneNumber,
			back_address,
		],
		callback
	);
}

function editShuttleBus(
	[
		ticketId,
		name,
		phoneNumber,
		address,
		back_name,
		back_phoneNumber,
		back_address,
	],
	callback
) {
	db.query(
		`
			UPDATE Shuttle_Bus
			SET name = ?, phone_number = ?, address = ?, back_name = ?, back_phone_number = ?, back_address = ?
			WHERE ticket_id = ?
		`,
		[
			name,
			phoneNumber,
			address,
			back_name,
			back_phoneNumber,
			back_address,
			ticketId,
		],
		callback
	);
}

function deleteShuttleBus(id, callback) {
	db.query(
		`
			DELETE FROM Shuttle_Bus
			WHERE id = ?
		`,
		id,
		callback
	);
}

function getSimpleGarage(callback) {
	db.query(
		`
			SELECT id, name
			FROM Garages
		`,
		callback
	);
}

function getSeatByScheduleID(scheduleId, callback) {
	db.query(
		`
			SELECT number, state
			FROM Seats
			WHERE schedule_id = ?
		`,
		scheduleId,
		callback
	);
}

function addTicketWithoutAccount(
	[
		name,
		phone,
		seats,
		payment,
		scheduleId,
		isPaid,
		discount,
		price,
		roundTrip,
	],
	callback
) {
	db.query(
		`
			CALL BookTicketWithoutAccount(?, ?, ?, ?, ?, ?, ?, ?, ?)
		`,
		[
			name,
			phone,
			seats,
			payment,
			scheduleId,
			isPaid,
			discount,
			price,
			roundTrip,
		],
		callback
	);
}

function paymentSchedule(ticketId, callback) {
	db.query(
		`
			UPDATE Tickets
			SET isPaid = 1, payment = 'offline'
			WHERE id = ?
		`,
		ticketId,
		callback
	);
}

function getAllSchedule(callback) {
	db.query(
		`
			SELECT DISTINCT cs.name AS start_city, ce.name AS end_city, r.distance, r.duration, sp.id AS start_city_id, ep.id AS end_city_id
			FROM Schedules s
			JOIN Routes r ON r.id = s.route_id
			JOIN Start_point sp ON sp.id = r.start_id
			JOIN End_point ep ON ep.id = r.end_id
			JOIN Cities cs ON cs.id = sp.city_id
			JOIN Cities ce ON ce.id = ep.city_id
		`,
		callback
	);
}

function isBooked([userId, scheduleId], callback) {
	db.query(
		`
			SELECT id, seat, back_seat, price
			FROM Tickets
			WHERE user_id = ? AND schedule_id = ?
		`,
		[userId, scheduleId],
		callback
	);
}

function editSeat([scheduleId, number, state], callback) {
	db.query(
		`
			UPDATE Seats
			SET state = ?
			WHERE schedule_id = ? AND number = ?
		`,
		[state, scheduleId, number],
		callback
	);
}

function changeSeatIntoTicket([ticketId, goSeat, backSeat], callback) {
	db.query(
		`
			UPDATE Tickets
			SET seat = ?, back_seat = ?
			WHERE id = ?
		`,
		[goSeat, backSeat, ticketId],
		callback
	);
}

module.exports = {
	getSchedule,
	getScheduleByID,
	getSeatByScheduleID,
	addTicket,
	bookSeat,
	getTicket,
	cancelTicket,
	cancelSeat,
	getTicketByUserId,
	increasePoint,
	getFeedback,
	addNewFeedback,
	modifyFeedback,
	addNewReplyFeedback,
	modifyReplyFeedback,
	getShuttleBus,
	addNewShuttleBus,
	deleteShuttleBus,
	getSimpleGarage,
	getSeatByScheduleID,
	addTicketWithoutAccount,
	paymentSchedule,
	addTicketWithShuttleBus,
	editShuttleBus,
	getAllSchedule,
	isBooked,
	getScheduleIdByTicketId,
	editSeat,
	changeSeatIntoTicket,
};
