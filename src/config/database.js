const sql = require('mysql2');

const connection = sql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'password',
	database: 'coach_ticket_booking',
});

connection.connect((err) => {
	if (err) throw err;
	console.log('Connected to database');
});

module.exports = connection;
