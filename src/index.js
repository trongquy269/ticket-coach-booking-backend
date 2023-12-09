const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const route = require('./routes/route.js');
const cors = require('cors');

app.use(cors());

// Middle ware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Route
route(app);

// Start server
app.listen(3000, () => {
	console.log('Server listening on port 3000');
});
