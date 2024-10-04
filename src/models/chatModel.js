const db = require('../config/database.js');

function addNewChat([userID, text, time, sender], callback) {
	db.query(
		`
			INSERT INTO Chats (user_id, text, time, sender)
			VALUES (?, ?, FROM_UNIXTIME(? / 1000), ?)
		`,
		[userID, text, time, sender],
		callback
	);
}

function getAllChats(userID, callback) {
	db.query(
		`
			SELECT text, UNIX_TIMESTAMP(time) * 1000 as time, sender
			FROM Chats
			WHERE user_id = ?
		`,
		userID,
		callback
	);
}

module.exports = { addNewChat, getAllChats };
