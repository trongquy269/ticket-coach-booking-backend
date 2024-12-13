const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const route = require('./routes/route.js');
const cors = require('cors');
require('dotenv').config();

const PORT = process.env.PORT;

// Middle ware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Route
route(app);

// Middleware to catch undefined routes and return error
app.use((req, res, next) => {
	res.status(404).json({
		error: 'Route not found',
		message: `Cannot ${req.method} ${req.originalUrl}`,
	});
});

// Start server
app.listen(PORT || 3000, () => {
	console.log(`Server listening on port ${PORT || 3000}`);
});
