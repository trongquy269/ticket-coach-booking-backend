const scheduleModel = require('../models/scheduleModel');

const formatDateYMD = (date) => {
	const datePart = date.match(/\d+/g),
		day = datePart[0],
		month = datePart[1],
		year = datePart[2];

	return year + '-' + month + '-' + day;
};

function getSchedule(req, res) {
	const startPlace = req.query.startPlace;
	const endPlace = req.query.endPlace;
	const startDate = req.query.startDate;

	if (startDate !== '') {
		scheduleModel.getSchedule(
			[startPlace, endPlace, formatDateYMD(startDate)],
			(err, result) => {
				if (err) throw err;

				if (result.length === 0) {
					res.status(200).send({ message: 'No schedule found' });
				} else {
					res.status(200).send(result);
				}
			}
		);
	} else {
		const currentDate = new Date();
		const promises = [];

		for (let i = 0; i < 3; i++) {
			const nextDay = new Date(currentDate);
			nextDay.setDate(currentDate.getDate() + i);

			const year = nextDay.getFullYear();
			const month = nextDay.getMonth() + 1;
			const date = nextDay.getDate();

			const _startDate = `${year}-${month}-${date}`;

			const promise = new Promise((resolve, reject) => {
				scheduleModel.getSchedule(
					[startPlace, endPlace, _startDate],
					(err, result) => {
						if (err) reject(err);
						else resolve(result);
					}
				);
			});

			promises.push(promise);
		}

		Promise.all(promises)
			.then((results) => {
				// Concatenate the results from all promises
				let finalResult = [];
				results.forEach((result) => {
					finalResult = finalResult.concat(result);
				});

				if (finalResult.length === 0) {
					res.status(200).send({ message: 'No schedule found' });
				} else {
					res.status(200).send(finalResult);
				}
			})
			.catch((err) => {
				throw err;
			});
	}
}

function viewSchedule(req, res) {
	const scheduleId = req.body.scheduleId;
	scheduleModel.getScheduleByID(scheduleId, (err, result) => {
		if (err) throw err;

		if (result.length === 0) {
			res.status(500).send({ message: 'No schedule found' });
		} else {
			scheduleModel.getSeatByScheduleID(scheduleId, (err, seats) => {
				if (err) throw err;

				result[0].seats = seats;
				res.status(200).send(result);
			});
		}
	});
}

function bookSchedule(req, res) {
	const userId = req.body.userId;
	const scheduleId = req.body.scheduleId;
	const seats = req.body.seats;
	const payment = req.body.payment;

	scheduleModel.addTicket(
		[userId, scheduleId, seats.join(','), payment],
		(err, result) => {
			if (err) throw err;

			scheduleModel.increasePoint(userId, (err, _result) => {
				if (err) throw err;
			});
		}
	);

	seats.forEach((seat) => {
		scheduleModel.bookSeat([scheduleId, seat], (err, result) => {
			if (err) throw err;
		});
	});

	res.status(200).send({ message: 'Ticket booked' });
}

function getTicket(req, res) {
	const userId = req.query.userId;
	const scheduleId = req.query.scheduleId;

	scheduleModel.getTicket([userId, scheduleId], (err, result) => {
		if (err) throw err;

		if (result.length === 0) {
			res.status(200).send({ message: 'No ticket found' });
		} else {
			res.status(200).send(result);
		}
	});
}

function cancelTicket(req, res) {
	const userId = req.query.userId;
	const scheduleId = req.query.scheduleId;

	scheduleModel.getTicket([userId, scheduleId], (err, result) => {
		if (err) throw err;

		if (result.length === 0) {
			res.status(500).send({ message: 'No ticket found' });
		} else {
			const seats = result[0].seat.split(',');
			seats.forEach((seat) => {
				scheduleModel.cancelSeat([scheduleId, seat], (err, result) => {
					if (err) throw err;
				});
			});

			scheduleModel.cancelTicket([userId, scheduleId], (err, result) => {
				if (err) throw err;
			});

			res.status(200).send({ message: 'Ticket canceled' });
		}
	});
}

function getMySchedule(req, res) {
	const userId = req.query.userId;

	scheduleModel.getTicketByUserId(userId, (err, result) => {
		if (err) throw err;

		if (result.length > 0) {
			res.status(200).send(result);
		} else {
			res.status(200).send({ message: 'No ticket found' });
		}
	});
}

module.exports = {
	getSchedule,
	viewSchedule,
	bookSchedule,
	getTicket,
	cancelTicket,
	getMySchedule,
};
