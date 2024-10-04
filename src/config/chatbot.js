const { Client } = require('undici');

const client = new Client('http://localhost:5000', {
	pipelining: 1, // Enable HTTP/1.1 pipelining
	keepAliveTimeout: 60 * 1000, // 60 seconds
	keepAliveMaxTimeout: 2 * 60 * 1000, // 2 minutes
});

const data = {
	message: 'Hello',
};

async function sendRequest() {
	try {
		const { statusCode, body } = await client.request({
			path: '/webhook',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});

		let responseData = '';
		for await (const chunk of body) {
			responseData += chunk;
		}

		if (statusCode === 200) {
			console.log('Response from Rasa server:', JSON.parse(responseData));
		} else {
			console.error('Failed to connect to Rasa server:', statusCode);
		}
	} catch (error) {
		console.error('Error:', error.message);
	}
}

sendRequest();
