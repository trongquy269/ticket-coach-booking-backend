const db = require('../config/database');

function getNotifiesByUserId(userId, callback) {
	db.query(
		`
		SELECT id, content, link, link_id, time, date, isSeen
		FROM Notifies
		WHERE user_id = ?
	`,
		userId,
		callback
	);
}

function seenNotify([userId, id], callback) {
	db.query(
		`
		UPDATE Notifies
		SET isSeen = 1
		WHERE user_id = ? AND id = ?
	`,
		[userId, id],
		callback
	);
}

function unSeenNotify([userId, id], callback) {
	db.query(
		`
		UPDATE Notifies
		SET isSeen = 0
		WHERE user_id = ? AND id = ?
	`,
		[userId, id],
		callback
	);
}

function deleteNotify([userId, id], callback) {
	db.query(
		`
		DELETE FROM Notifies
		WHERE user_id = ? AND id = ?
	`,
		[userId, id],
		callback
	);
}

module.exports = {
	getNotifiesByUserId,
	seenNotify,
	unSeenNotify,
	deleteNotify,
};
