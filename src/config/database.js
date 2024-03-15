const sql = require('mysql2');

const connection = sql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '_Password123',
	database: 'coach_ticket_booking',
	timezone: 'Z',
});

connection.connect((err) => {
	if (err) throw err;
	console.log('Connected to database');
});

module.exports = connection;
