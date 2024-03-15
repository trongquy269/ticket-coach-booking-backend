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

function addTicket([userId, scheduleId, seats, payment], callback) {
	db.query(
		`
		INSERT INTO Tickets (user_id, schedule_id, seat, payment)
		VALUES (?, ?, ?, ?)
		`,
		[userId, scheduleId, seats, payment],
		callback
	);
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
		WHERE user_id = ?
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
};
