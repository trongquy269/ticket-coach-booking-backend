const scheduleModel = require('../models/scheduleModel');

const formatDateYMD = (date) => {
	const datePart = date.match(/\d+/g),
		day = datePart[0],
		month = datePart[1],
		year = datePart[2];

	return year + '-' + month + '-' + day;
};

function getSchedule (req, res) {
	const startPlace = req.query.startPlace;
	const endPlace = req.query.endPlace;
	const startDate = req.query.startDate;

	if (startDate !== '') {
		scheduleModel.getSchedule(
			[startPlace, endPlace, formatDateYMD(startDate)],
			(err, result) => {
				if (err) {
					throw err;
				}

				if (result.length === 0) {
					res.status(200).send({ message: 'No schedule found' });
				} else {
					res.status(200).send(result);
				}
			},
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
						if (err) {
							reject(err);
						} else {
							resolve(result);
						}
					},
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

function viewSchedule (req, res) {
	const scheduleId = req.body.scheduleId;
	scheduleModel.getScheduleByID(scheduleId, (err, result) => {
		if (err) {
			throw err;
		}

		if (result.length === 0) {
			res.status(500).send({ message: 'No schedule found' });
		} else {
			scheduleModel.getSeatByScheduleID(scheduleId, (err, seats) => {
				if (err) {
					throw err;
				}

				result[0].seats = seats;
				res.status(200).send(result);
			});
		}
	});
}

function bookSchedule (req, res) {
	const userId = req.body.userId;
	const scheduleId = req.body.scheduleId;
	const scheduleBackId = req.body.scheduleBackId || null;
	const seats = req.body.seats;
	const seatsBack = req.body.seatsBack || [];
	const payment = req.body.payment;
	const price = req.body.price;
	const isPaid = req.body.isPaid || 0;
	const discount = req.body.discount || 0;
	const roundTrip = scheduleBackId ? 1 : 0;

	scheduleModel.addTicket(
		[
			userId,
			scheduleId,
			scheduleBackId,
			seats.join(','),
			seatsBack.join(','),
			payment,
			price,
			isPaid,
			discount,
			roundTrip,
		],
		(err, result) => {
			if (err) {
				throw err;
			}

			scheduleModel.increasePoint(userId, (err, _result) => {
				if (err) {
					throw err;
				}
			});
		},
	);

	seats.forEach((seat) => {
		scheduleModel.bookSeat([scheduleId, seat], (err, result) => {
			if (err) {
				throw err;
			}
		});
	});

	if (scheduleBackId) {
		seatsBack.forEach((seat) => {
			scheduleModel.bookSeat([scheduleBackId, seat], (err, result) => {
				if (err) {
					throw err;
				}
			});
		});
	}

	res.status(200).send({ message: 'Ticket booked' });
}

function bookScheduleWithShuttleBus (req, res) {
	const userId = req.body.userId;
	const scheduleId = req.body.scheduleId;
	const scheduleBackId = req.body.scheduleBackId || null;
	const seats = req.body.seats;
	const back_seats = req.body.seatsBack || [];
	const payment = req.body.payment;
	const price = req.body.price;
	const isPaid = req.body.isPaid || 0;
	const discount = req.body.discount || 0;
	const roundTrip = scheduleBackId ? 1 : 0;
	const shuttleBusName = req.body.shuttleBusName;
	const shuttleBusPhone = req.body.shuttleBusPhone;
	const shuttleBusAddress = req.body.shuttleBusAddress;
	const backShuttleBusName = req.body.backShuttleBusName || '';
	const backShuttleBusPhone = req.body.backShuttleBusPhone || '';
	const backShuttleBusAddress = req.body.backShuttleBusAddress || '';

	scheduleModel.addTicketWithShuttleBus(
		[
			userId,
			scheduleId,
			scheduleBackId,
			seats.join(','),
			back_seats.join(','),
			payment,
			price,
			isPaid,
			discount,
			roundTrip,
			shuttleBusName,
			shuttleBusPhone,
			shuttleBusAddress,
			backShuttleBusName,
			backShuttleBusPhone,
			backShuttleBusAddress,
		],
		(err, result) => {
			if (err) {
				throw err;
			}

			scheduleModel.increasePoint(userId, (err, _result) => {
				if (err) {
					throw err;
				}
			});
		},
	);

	seats.forEach((seat) => {
		scheduleModel.bookSeat([scheduleId, seat], (err, result) => {
			if (err) {
				throw err;
			}
		});
	});

	if (scheduleBackId) {
		back_seats.forEach((seat) => {
			scheduleModel.bookSeat([scheduleBackId, seat], (err, result) => {
				if (err) {
					throw err;
				}
			});
		});
	}

	res.status(200).send({ message: 'Ticket booked' });
}

function getTicket (req, res) {
	const userId = req.query.userId;
	const scheduleId = req.query.scheduleId;

	scheduleModel.getTicket([userId, scheduleId], (err, result) => {
		if (err) {
			throw err;
		}

		if (result.length === 0) {
			res.status(200).send({ message: 'No ticket found' });
		} else {
			res.status(200).send(result);
		}
	});
}

function cancelTicket (req, res) {
	const userId = req.query.userId;
	const scheduleId = req.query.scheduleId;

	scheduleModel.getTicket([userId, scheduleId], (err, result) => {
		if (err) {
			throw err;
		}

		if (result.length === 0) {
			res.status(500).send({ message: 'No ticket found' });
		} else {
			const seats = result[0].seat.split(',');
			seats.forEach((seat) => {
				scheduleModel.cancelSeat([scheduleId, seat], (err, result) => {
					if (err) {
						throw err;
					}
				});
			});

			scheduleModel.cancelTicket([userId, scheduleId], (err, result) => {
				if (err) {
					throw err;
				}
			});

			res.status(200).send({ message: 'Ticket canceled' });
		}
	});
}

function getMySchedule (req, res) {
	const userId = req.query.userId;

	scheduleModel.getTicketByUserId(userId, (err, result) => {
		if (err) {
			throw err;
		}

		if (result.length > 0) {
			res.status(200).send(result);
		} else {
			res.status(200).send({ message: 'No ticket found' });
		}
	});
}

function getFeedback (req, res) {
	const scheduleId = req.query.scheduleId;

	scheduleModel.getFeedback(scheduleId, (err, result) => {
		if (err) {
			throw err;
		}

		res.status(200).send(result);
	});
}

function sendFeedback (req, res) {
	const userId = req.body.userId;
	const scheduleId = req.body.scheduleId;
	const rate = req.body.rate;
	let content = req.body.content;

	if (content === '') {
		content = 'Khách hàng đã không để lại bất kỳ lời đánh giá nào.';
	}

	scheduleModel.addNewFeedback(
		[userId, scheduleId, rate, content],
		(err, result) => {
			if (err) {
				throw err;
			}

			res.status(200).send({ message: 'success' });
		},
	);
}

function changeFeedback (req, res) {
	const feedbackId = req.body.feedbackId;
	const rate = req.body.rate;
	const content = req.body.content;

	scheduleModel.modifyFeedback([feedbackId, rate, content], (err, result) => {
		if (err) {
			throw err;
		}

		res.status(200).send({ message: 'success' });
	});
}

function getReplyFeedback (req, res) {
}

function sendReplyFeedback (req, res) {
	const feedbackId = req.body.feedbackId;
	const content = req.body.content;

	scheduleModel.addNewReplyFeedback([feedbackId, content], (err, result) => {
		if (err) {
			throw err;
		}

		res.status(200).send({ message: 'success' });
	});
}

function changeReplyFeedback (req, res) {
	const feedbackId = req.body.feedbackId;
	const content = req.body.content;

	scheduleModel.modifyReplyFeedback([feedbackId, content], (err, result) => {
		if (err) {
			throw err;
		}

		res.status(200).send({ message: 'success' });
	});
}

function getShuttleBus (req, res) {
	const ticketId = req.query.ticketId;

	scheduleModel.getShuttleBus([ticketId], (err, result) => {
		if (err) {
			throw err;
		}

		if (result.length === 0) {
			res.status(200).json({ message: 'Not register' });
		} else {
			res.status(200).send(result[0]);
		}
	});
}

function addShuttleBus (req, res) {
	const ticketId = req.body.ticketId;
	const name = req.body.name;
	const phoneNumber = req.body.phoneNumber;
	const address = req.body.address;
	const back_name = req.body.back_name;
	const back_phoneNumber = req.body.back_phoneNumber;
	const back_address = req.body.back_address;

	scheduleModel.addNewShuttleBus(
		[
			ticketId,
			name,
			phoneNumber,
			address,
			back_name,
			back_phoneNumber,
			back_address,
		],
		(error, result) => {
			if (error) {
				throw error;
			}

			res.status(200).send({ message: 'success' });
		},
	);
}

function editShuttleBus (req, res) {
	const ticketId = req.body.ticketId;
	const name = req.body.name;
	const phoneNumber = req.body.phoneNumber;
	const address = req.body.address;
	const back_name = req.body.back_name;
	const back_phoneNumber = req.body.back_phoneNumber;
	const back_address = req.body.back_address;

	scheduleModel.editShuttleBus(
		[
			ticketId,
			name,
			phoneNumber,
			address,
			back_name,
			back_phoneNumber,
			back_address,
		],
		(error, result) => {
			if (error) {
				throw error;
			}

			res.status(200).send({ message: 'success' });
		},
	);
}

function deleteShuttleBus (req, res) {
	const id = req.query.id;

	scheduleModel.deleteShuttleBus(id, (error, result) => {
		if (error) {
			throw error;
		}

		res.status(200).send({ message: 'success' });
	});
}

function getSimpleGarage (req, res) {
	scheduleModel.getSimpleGarage((err, result) => {
		if (err) {
			throw err;
		}

		res.status(200).send(result);
	});
}

function getSeat (req, res) {
	const scheduleId = req.query.scheduleId;

	scheduleModel.getSeatByScheduleID(scheduleId, (err, result) => {
		if (err) {
			throw err;
		}

		res.status(200).send(result);
	});
}

function bookScheduleWithoutAccount (req, res) {
	const name = req.body.name;
	const phone = req.body.phone;
	const scheduleId = req.body.scheduleId;
	const seats = req.body.seats;
	const payment = req.body.payment;
	const price = req.body.price;
	const isPaid = req.body.isPaid || 0;
	const discount = req.body.discount || 0;
	const roundTrip = req.body.roundTrip || 0;

	scheduleModel.addTicketWithoutAccount(
		[
			name,
			phone,
			seats.join(','),
			payment,
			scheduleId,
			isPaid,
			discount,
			price,
			roundTrip,
		],
		(err, result) => {
			if (err) {
				throw err;
			}
		},
	);

	seats.forEach((seat) => {
		scheduleModel.bookSeat([scheduleId, seat], (err, result) => {
			if (err) {
				throw err;
			}
		});
	});

	res.status(200).send({ message: 'Ticket booked' });
}

function paymentSchedule (req, res) {
	const ticketId = req.body.ticketId;

	scheduleModel.paymentSchedule(ticketId, (err, result) => {
		if (err) {
			throw err;
		}

		res.status(200).send({ message: 'success' });
	});
}

function getAllSchedule (req, res) {
	const groupData = (arr) => {
		const groupedData = [];
		let child = [];

		for (let i = 0; i < arr.length; i++) {
			if (child.length === 0) {
				child.push(arr[i]);
			} else {
				if (arr[i].start_city === child[child.length - 1].start_city) {
					child.push(arr[i]);
				} else {
					groupedData.push(child);
					child = [arr[i]];
				}
			}
		}

		if (child.length > 0) {
			groupedData.push(child);
		}

		return groupedData;
	};

	scheduleModel.getAllSchedule((err, result) => {
		if (err) {
			throw err;
		}

		res.status(200).json(groupData(result));
	});
}

function isBooked (req, res) {
	const userId = req.body.userId;
	const scheduleId = req.body.scheduleId;

	scheduleModel.isBooked([userId, scheduleId], (error, result) => {
		if (error) {
			throw error;
		}

		if (result.length === 0) {
			res.status(200).json({
				message: 'Ticket not booked',
			});
		} else {
			res.status(200).json({
				message: 'Ticket booked',
				ticketId: result[0].id,
				goSeats: result[0].seat.split(','),
				backSeats: result[0]?.back_seat?.split(',') || null,
				price: result[0].price,
			});
		}
	});
}

function changeSeat (req, res) {
	const ticketId = req.body.ticketId;
	const oldGoSeat = req.body.oldGoSeat;
	const oldBackSeat = req.body.oldBackSeat;
	const newGoSeat = req.body.newGoSeat;
	const newBackSeat = req.body.newBackSeat;

	scheduleModel.getScheduleIdByTicketId(ticketId, (err, result) => {
		if (err) {
			throw err;
		}

		console.log(result[0]);
		const scheduleId = result[0].schedule_id;
		const scheduleBackId = result[0].schedule_back_id;

		oldGoSeat.forEach((seat) => {
			scheduleModel.editSeat(
				[scheduleId, seat, 'empty'],
				(err, result) => {
					if (err) {
						throw err;
					}
				},
			);
		});

		newGoSeat.forEach((seat) => {
			scheduleModel.editSeat(
				[scheduleId, seat, 'full'],
				(err, result) => {
					if (err) {
						throw err;
					}
				},
			);
		});

		if (scheduleBackId) {
			oldBackSeat.forEach((seat) => {
				scheduleModel.editSeat(
					[scheduleId, seat, 'empty'],
					(err, result) => {
						if (err) {
							throw err;
						}
					},
				);
			});

			newBackSeat.forEach((seat) => {
				scheduleModel.editSeat(
					[scheduleId, seat, 'full'],
					(err, result) => {
						if (err) {
							throw err;
						}
					},
				);
			});
		}

		scheduleModel.changeSeatIntoTicket(
			[ticketId, newGoSeat.join(','), newBackSeat.join(',')],
			(err, result) => {
				if (err) {
					throw err;
				}

				res.status(200).json({ message: 'success' });
			},
		);
	});
}

module.exports = {
	getSchedule,
	viewSchedule,
	bookSchedule,
	getTicket,
	cancelTicket,
	getMySchedule,
	getFeedback,
	sendFeedback,
	changeFeedback,
	getReplyFeedback,
	sendReplyFeedback,
	changeReplyFeedback,
	getShuttleBus,
	addShuttleBus,
	editShuttleBus,
	deleteShuttleBus,
	getSimpleGarage,
	getSeat,
	bookScheduleWithoutAccount,
	paymentSchedule,
	bookScheduleWithShuttleBus,
	getAllSchedule,
	isBooked,
	changeSeat,
};
