const chatModel = require('../models/chatModel.js');
const { request } = require('undici');

async function sendToRasa (user_id, message) {
	const url = 'http://0.0.0.0:5005/webhooks/rest/webhook';
	const data = {
		sender: user_id,
		message,
	};

	try {
		const response = await request(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});

		const responseBody = await response.body.json();
		return responseBody;
	} catch (error) {
		console.error(error);
	}
}

function getChat (req, res) {
	const userID = req.query.userID;

	chatModel.getAllChats(userID, (err, result) => {
		if (err) {
			throw err;
		}

		if (result.length > 0) {
			res.status(200).send(result);
		} else {
			const text = btoa(
				encodeURIComponent(
					'Chào bạn đã đến với dịch vụ chăm sóc khách hàng của COACH BOOKING. Nếu bạn cần hỗ trợ, hãy gửi nó đến với chúng tôi.',
				),
			);
			const time = new Date().getTime();
			const sender = 'bot';

			chatModel.addNewChat(
				[userID, text, time, sender],
				(_err, _result) => {
					if (_err) {
						throw _err;
					}
				},
			);

			res.status(200).send([{ text, time, sender }]);
		}
	});
}

function sendChat (req, res) {
	const user_id = req.body.userId;
	const text = req.body.text;
	const plaintext = decodeURIComponent(atob(text));
	const time = req.body.time;

	chatModel.addNewChat([user_id, text, time, 'own'], async (err, result) => {
		if (err) {
			throw err;
		}

		// Bot response
		const bot_response = await sendToRasa(user_id, plaintext) || [];
		const text = bot_response.length === 0 ? 'Không tìm thấy nội dung' : bot_response[0].text;
		const bot_text = btoa(encodeURIComponent(text));
		const bot_time = new Date().getTime();
		const sender = 'bot';

		chatModel.addNewChat(
			[user_id, bot_text, bot_time, sender],
			(_err, _result) => {
				if (_err) {
					throw _err;
				}

				res.status(200).send({
					text: bot_text,
					time: bot_time,
					sender,
				});
			},
		);
	});
}

module.exports = {
	getChat,
	sendChat,
};
