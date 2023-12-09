const db = require('../config/database.js');

function getPhone(email, callback) {
	db.query(
		`
		SELECT phone
		FROM Users
		WHERE email = ?
		`,
		email,
		callback
	);
}

function getUserByEmail(email, callback) {
	db.query(
		`
		SELECT Accounts.user_id, Users.name, Users.email, Users.phone, Accounts.role
		FROM Users, Accounts
		WHERE Users.email = ?
			AND Users.id = Accounts.user_id
		`,
		email,
		callback
	);
}

function getEmailByUsername(username, callback) {
	db.query(
		`
		SELECT Users.email
		FROM Accounts, Users
		WHERE Accounts.user_id = Users.id
			AND Accounts.username = ?
		`,
		username,
		callback
	);
}

function changePassword([username, newPassword], callback) {
	db.query(
		`
		UPDATE Accounts
		SET password = ?
		WHERE user_id = (
			SELECT id
			FROM Users
			WHERE username = ?
		)
		`,
		[newPassword, username],
		callback
	);
}

function isEmailExist(email, callback) {
	db.query(
		`
		SELECT name
		FROM Users
		WHERE email = ?
		`,
		email,
		callback
	);
}

function isPhoneExist(phone, callback) {
	db.query(
		`
		SELECT name
		FROM Users
		WHERE phone = ?
		`,
		phone,
		callback
	);
}

function login([username, password], callback) {
	db.query(
		`
		SELECT Accounts.user_id, Users.name, Users.email, Accounts.role
		FROM Accounts, Users
		WHERE Accounts.username = ?
			AND Accounts.password = ?
			AND Accounts.user_id = Users.id
		`,
		[username, password],
		callback
	);
}

function register([username, password], callback) {
	db.query(
		`
		INSERT INTO Accounts (username, password, role)
		VALUES (?, ?, 'customer')
		`,
		[username, password],
		callback
	);
}

function addNewUser(
	[
		name,
		formattedDate,
		gender,
		email,
		phone,
		citizenIdentification,
		city,
		district,
	],
	callback
) {
	db.query(
		`
		INSERT INTO Users (name, gender, date_of_birth, phone, citizen_identification, email, accommodation, point, district_id)
		VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
		`,
		[
			name,
			gender,
			formattedDate,
			phone,
			citizenIdentification,
			email,
			city,
			district,
		],
		callback
	);
}

function linkAccountWithUser([email, phone], callback) {
	db.query(
		`
		UPDATE Accounts
		SET user_id = (
			SELECT id
			FROM Users
			WHERE email = ? OR phone = ?
		)
		WHERE username = ? OR username = ?
		`,
		[email, phone, email, phone],
		callback
	);
}

module.exports = {
	getPhone,
	getUserByEmail,
	getEmailByUsername,
	changePassword,
	isEmailExist,
	isPhoneExist,
	login,
	register,
	addNewUser,
	linkAccountWithUser,
};
