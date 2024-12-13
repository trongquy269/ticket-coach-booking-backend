const WebSocket = require('ws');
require('dotenv').config();

const wss = new WebSocket.Server({ port: process.env.WS_PORT });

wss.on('connection', (ws) => {
	console.log('New client connected');

	ws.on('message', (message) => {
		console.log('Received:', message);
	});

	ws.on('close', () => {
		console.log('Client disconnected');
	});
});

module.exports = wss;
