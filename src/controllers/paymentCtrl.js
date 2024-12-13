const crypto = require('crypto');
const axios = require('axios');
const WebSocket = require('ws');
const wss = require('../config/websocket');
const client = require('../config/square');
const { WebhooksHelper } = require('square');

const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;
const PROCESSED_ORDERS = new Map();

async function createOnlinePayment(req, res) {
	const phone = req.body.phone; // Ensure you're getting the correct field
	const price_USD = req.body.price_USD;
	const idempotency_key = crypto.randomUUID();

	try {
		const response = await client.checkoutApi.createPaymentLink({
			idempotencyKey: idempotency_key,
			description: 'Thanh toán vé xe',
			quickPay: {
				name: 'ticket',
				priceMoney: {
					amount: price_USD,
					currency: 'USD',
				},
				locationId: 'LY5VGM0CFMMQE',
			},
			prePopulatedData: {
				buyerPhoneNumber: phone,
			},
		});

		const paymentLink = await response.result.paymentLink;
		const url = paymentLink.url;
		const orderId = paymentLink.orderId;

		res.json({ paymentLink: url });
	} catch (error) {
		console.log(error);
	}
}

const SIGNATURE_KEY = process.env.SQUARE_SIGNATURE_KEY;
const NOTIFICATION_URL = `https://${process.env.NGROK_DOMAIN_ID}.ngrok-free.app/webhooks/square`;

// Function to validate the webhook signature
function isFromSquare(signature, body) {
	return WebhooksHelper.isValidWebhookEventSignature(
		body,
		signature,
		SIGNATURE_KEY,
		NOTIFICATION_URL
	);
}

function squareResponse(req, res) {
	const body = JSON.stringify(req.body);
	const signature = req.headers['x-square-hmacsha256-signature'];

	if (isFromSquare(signature, body)) {
		// Signature is valid, process the webhook event here
		// console.log('Received valid Square webhook:', req.body);
		// console.log('Object: ', req.body.data.object);

		if (
			req.body.type === 'order.updated' &&
			req.body.data.object.order_updated.state === 'OPEN'
		) {
			const orderId = req.body.data.object.order_updated.order_id;

			// Check if this orderId has already been processed
			if (!PROCESSED_ORDERS.has(orderId)) {
				PROCESSED_ORDERS.set(orderId, true);

				wss.clients.forEach((client) => {
					if (client.readyState === WebSocket.OPEN) {
						client.send(JSON.stringify({ success: true }));
					}
				});
			}
		}

		res.status(200).send('Webhook received successfully');
	} else {
		// Invalid signature, reject the request
		res.status(403).send('Forbidden');
	}
}

module.exports = { createOnlinePayment, squareResponse };
