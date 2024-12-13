const sql = require('mysql2');
require('dotenv').config();

const pool = sql.createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	timezone: 'Z',
	multipleStatements: true,
	waitForConnections: true,
	connectionLimit: 10,
	maxIdle: 10,
	idleTimeout: 60000,
	queueLimit: 0,
	enableKeepAlive: true,
	keepAliveInitialDelay: 0,
});

pool.getConnection((err) => {
	if (err) throw err;
	console.log('Connected to database');
});

module.exports = pool;
