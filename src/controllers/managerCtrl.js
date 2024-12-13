const jwt = require('jsonwebtoken');
const managerModel = require('../models/managerModel');

const hashPassword = (password) => {
	return jwt.sign(password, 'secret', { algorithm: 'HS256' });
};

function getAllGarage (req, res) {
	managerModel.getAllGarage((err, result) => {
		if (err) {
			throw err;
		}

		if (result.length === 0) {
			res.status(200).message('No garage found');
		} else {
			res.status(200).send(result);
		}
	});
}

function addNewGarage (req, res) {
	const name = req.body.name.toUpperCase();
	const description = req.body.description || 'empty';

	// Check garage exist
	managerModel.getGarageByName(name, (err, result) => {
		if (err) {
			throw err;
		}

		if (result.length > 0) {
			res.status(200).send({ message: 'Garage already exist' });
		} else {
			managerModel.addNewGarage([name, description], (err, result) => {
				if (err) {
					throw err;
				}

				res.status(200).send({ message: 'success' });
			});
		}
	});
}

function editGarage (req, res) {
	const id = req.body.id;
	const name = req.body.name;
	const description = req.body.description;
	const key = name ? 'name' : 'description';
	let value = '';

	if (name) {
		value = name.toUpperCase();
	} else {
		value = description;
	}

	managerModel.editGarage([id, key, value], (err, result) => {
		if (err) {
			throw err;
		}

		res.status(200).send({ message: 'success' });
	});
}

function removeGarage (req, res) {
	const id = req.body.id;
	const reason = req.body.reason;

	managerModel.removeGarage(id, (err, result) => {
		if (err) {
			throw err;
		}

		res.status(200).send({ message: 'success' });
	});
}

function getAllCoach (req, res) {
	managerModel.getAllCoach((err, result) => {
		if (err) {
			throw err;
		}

		if (result.length === 0) {
			res.status(200).message('No coach found');
		} else {
			res.status(200).send(result);
		}
	});
}

function addNewCoach (req, res) {
	const vehicleNumber = req.body.vehicleNumber;
	const manufacturer = req.body.manufacturer;
	const licensePlate = req.body.licensePlate;
	const garageId = req.body.garageId;
	const typeId = req.body.typeId;
	const numberSeat = typeId === 2 ? 45 : 40;

	// Check coach exist
	managerModel.getCoachByVehicleNumber(licensePlate, (err, result) => {
		if (err) {
			throw err;
		}

		if (result.length > 0) {
			res.status(200).send({ message: 'Coach already exist' });
		} else {
			managerModel.addNewCoach(
				[
					vehicleNumber,
					manufacturer,
					licensePlate,
					numberSeat,
					garageId,
					typeId,
				],
				(err, result) => {
					if (err) {
						throw err;
					}

					res.status(200).send({ message: 'success' });
				},
			);
		}
	});
}

function editCoach (req, res) {
	const id = req.body.id;
	let key = req.body.key;
	let value = req.body.value;

	if (key === 'vehicle_number') {
		value = parseInt(value);
	}
	if (key === 'garage') {
		key = 'garage_id';
	}

	managerModel.editCoach([id, key, value], (err, result) => {
		if (err) {
			throw err;
		}

		res.status(200).send({ message: 'success' });
	});
}

function removeCoach (req, res) {
	const id = req.body.id;
	const reason = req.body.reason;

	managerModel.removeCoach(id, (err, result) => {
		if (err) {
			throw err;
		}

		res.status(200).send({ message: 'success' });
	});
}

function getAllUser (req, res) {
	managerModel.getAllUser((err, result) => {
		if (err) {
			throw err;
		}

		if (result.length === 0) {
			res.status(200).message('No user found');
		} else {
			res.status(200).send(result);
		}
	});
}

function addNewUser (req, res) {
	const name = req.body.name;
	const email = req.body.email;
	const username = req.body.phone;
	const password = req.body.password;
	const phone = req.body.phone;
	const city = req.body.city;
	const district = req.body.district;
	const gender = req.body.gender;
	const dateOfBirth = req.body.dateOfBirth;
	const citizenIdentification = req.body.citizenIdentification;

	// Hash password
	const passwordHashed = hashPassword(password);

	// Check user exist
	managerModel.checkUserExist(phone, (err, result) => {
		if (err) {
			throw err;
		}

		if (result.length > 0) {
			res.status(200).send({ message: 'User already exist' });
		} else {
			managerModel.addNewUser(
				[
					name,
					gender,
					dateOfBirth,
					email,
					phone,
					citizenIdentification,
					city,
					district,
					username,
					passwordHashed,
				],
				(_err, _result) => {
					if (_err) {
						throw _err;
					}

					res.status(200).send({ message: 'success' });
				},
			);
		}
	});
}

function editUser (req, res) {
	const phone = req.body.phone;
	const value = req.body.value.trim();
	let key = req.body.key;

	if (key === 'district') {
		key = 'district_id';
	} else if (key === 'city') {
		key = 'accommodation';
	}

	if (key !== 'phone') {
		managerModel.editUser([phone, key, value], (err, result) => {
			if (err) {
				throw err;
			}

			res.status(200).send({ message: 'success' });
		});
	} else {
		managerModel.editUser([phone, key, value], (err, result) => {
			if (err) {
				throw err;
			}

			// Check username is phone
			managerModel.checkUsernameIsPhone(phone, (err, _result) => {
				if (err) {
					throw err;
				}

				if (_result.length > 0) {
					const user_id = _result[0].user_id;
					managerModel.updateUsername(
						[value, user_id],
						(err, __result) => {
							if (err) {
								throw err;
							}

							res.status(200).send({ message: 'success' });
						},
					);
				} else {
					res.status(200).send({ message: 'success' });
				}
			});
		});
	}
}

function removeUser (req, res) {
	const id = req.body.id;
	const reason = req.body.reason;

	managerModel.removeUserById(id, (err, result) => {
		if (err) {
			throw err;
		}

		res.status(200).send({ message: 'success' });
	});
}

function getAllSchedule (req, res) {
	managerModel.getAllSchedule((err, result) => {
		if (err) {
			throw err;
		}

		if (result.length === 0) {
			res.status(200).message('No schedule found');
		} else {
			res.status(200).send(result);
		}
	});
}

function getSearchSuggestions (req, res) {
	const searchData = req.query.searchData;
	const typeSearch = req.query.typeSearch;

	if (typeSearch === 'customer') {
		managerModel.searchSuggestionUsers(searchData, (error, result) => {
			if (error) {
				throw error;
			}

			res.status(200).send(result);
		});
	} else if (typeSearch === 'schedule') {
	} else if (typeSearch === 'ticket') {
		managerModel.searchSuggestionTickets(searchData, (error, result) => {
			if (error) {
				throw error;
			}

			res.status(200).send(result);
		});
	} else if (typeSearch === 'coach') {
	} else if (typeSearch === 'garage') {
	}
}

function getSearch (req, res) {
	const searchData = req.query.searchData;
	const typeSearch = req.query.typeSearch;

	if (typeSearch === 'customer') {
		managerModel.searchUsers(searchData, (error, result) => {
			if (error) {
				throw error;
			}

			res.status(200).send(result);
		});
	} else if (typeSearch === 'schedule') {
	} else if (typeSearch === 'ticket') {
		managerModel.searchTickets(+searchData, (error, result) => {
			if (error) {
				throw error;
			}

			res.status(200).send(result);
		});
	} else if (typeSearch === 'coach') {
	} else if (typeSearch === 'garage') {
	}
}

function getTicketById (req, res) {
	const ticketId = req.query.ticketId;

	managerModel.getTicketById(ticketId, (err, result) => {
		if (err) {
			throw err;
		}

		res.status(200).send(result);
	});
}

function getNameGarage (req, res) {
	managerModel.getAllNameGarage((error, result) => {
		if (error) {
			throw error;
		}

		res.status(200).send(result);
	});
}

function getTicketParameter (req, res) {
	const timeInterval = req.query.timeInterval;
	const startDate = req.query.startDate;
	const endDate = req.query.endDate;

	managerModel.getTicketParameter(
		timeInterval,
		startDate,
		endDate,
		(error, result) => {
			if (error) {
				throw error;
			}

			res.status(200).send(result);
		},
	);
}

async function addNewSchedule (req, res) {
	try {
		const { startPlaceId, endPlaceId, fromDate, toDate, scheduleTime, distance, duration } = req.body;

		const startPointResult = await new Promise((resolve, reject) => {
			managerModel.addNewAndGetStartPoint([startPlaceId, null], (error, result) => {
				if (error) {
					return reject(error);
				}

				resolve(result);
			});
		});

		const startPointId = startPointResult[0].insertId;

		const endPointResult = await new Promise((resolve, reject) => {
			managerModel.addNewAndGetEndPoint([endPlaceId, null], (error, result) => {
				if (error) {
					return reject(error);
				}

				resolve(result);
			});
		});

		const endPointId = endPointResult[0].insertId;

		const routeResult = await new Promise((resolve, reject) => {
			managerModel.addNewAndGetRoute(
				[startPointId, endPointId, distance, duration]
				, (error, result) => {
					if (error) {
						return reject(error);
					}

					resolve(result);
				});
		});
		const routeId = routeResult[0].insertId;

		const finalDate = new Date(toDate);
		let currentDate = new Date(fromDate);

		// Loop through dates and schedule times
		while (currentDate <= finalDate) {
			for (const item of scheduleTime) {
				await managerModel.addNewSchedule(
					[routeId, new Date(currentDate), item.time,
					 item.price, item.discount, item.coachId],
					(error, result) => {
						if (error) {
							throw error;
						}
					},
				);
			}
			// Move to the next day
			currentDate.setDate(currentDate.getDate() + 1);
		}

		res.status(200).json({ message: 'Success' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Error occurred', error });
	}
}

function getTypeCoach (req, res) {
	managerModel.getTypeCoach((error, result) => {
		if (error) {
			throw error;
		}

		res.status(200).send(result.slice(1));
	});
}

function getSimpleCoach (req, res) {
	const userId = req.query.userId;

	managerModel.getSimpleCoach(userId, (error, result) => {
		if (error) {
			throw error;
		}

		res.status(200).send(result);
	});
}

function getFigures (req, res) {
	const time = req.query.time;
	const type = req.query.type;

	const getMaxDateOfMonth = (month) => {
		const currentYear = new Date().getFullYear();
		const nextMonth = new Date(currentYear, month, 1);
		nextMonth.setDate(0);
		return nextMonth.getDate();
	};

	if (type === 'day') {
		managerModel.getFiguresWithDay(time, (err, result) => {
			if (err) {
				throw err;
			}

			res.status(200).json(result);
		});
	} else if (type === 'week') {
		const currentYear = new Date().getFullYear();
		const firstDayOfYear = new Date(currentYear, 0, 1);
		const dayOfWeek = firstDayOfYear.getDay();
		const daysToFirstMonday = (
			dayOfWeek <= 4 ? 1 - dayOfWeek : 8 - dayOfWeek
		);
		const firstMonday = new Date(currentYear, 0, 1 + daysToFirstMonday);
		const startDate = new Date(firstMonday);
		startDate.setDate(firstMonday.getDate() + (
			time - 1
		) * 7);

		const endDate = new Date(startDate);
		endDate.setDate(startDate.getDate() + 6);

		// Format the dates as 'YYYY-MM-DD'
		const formatDate = (date) => {
			const month = date.getMonth() + 1; // Months are 0-based
			const day = date.getDate();
			return `${currentYear}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
		};

		const from = `${formatDate(startDate)} 00:00:00`;
		const to = `${formatDate(endDate)} 23:59:59`;
		//console.log('from: ' + from, 'to: ' + to);

		managerModel.getFiguresManyDays([from, to], (err, result) => {
			if (err) {
				throw err;
			}

			res.status(200).json(result);
		});
	} else if (type === 'month') {
		const currentYear = new Date().getFullYear();
		const nextMonth = new Date(currentYear, time, 1);
		nextMonth.setDate(0);
		const maxDate = getMaxDateOfMonth(time);
		const from = `${currentYear}-${time}-1 00:00:00`;
		const to = `${currentYear}-${time}-${maxDate} 23:59:59`;
		//console.log('from: ' + from, 'to: ' + to);

		managerModel.getFiguresManyDays([from, to], (err, result) => {
			if (err) {
				throw err;
			}

			res.status(200).json(result);
		});
	} else if (type === 'quarter') {
		const currentYear = new Date().getFullYear();
		const firstMonth = 3 * time - 3 + 1;
		const lastMonth = 3 * time;
		const maxDateLastMonth = getMaxDateOfMonth(lastMonth);
		const from = `${currentYear}-${firstMonth}-1 00:00:00`;
		const to = `${currentYear}-${lastMonth}-${maxDateLastMonth} 23:59:59`;
		//console.log('from: ' + from, 'to: ' + to);

		managerModel.getFiguresManyDays([from, to], (err, result) => {
			if (err) {
				throw err;
			}

			res.status(200).json(result);
		});
	} else if (type === 'year') {
		const from = `${time}-1-1 00:00:00`;
		const to = `${time}-12-31 23:59:59`;
		//console.log('from: ' + from, 'to: ' + to);

		managerModel.getFiguresManyDays([from, to], (err, result) => {
			if (err) {
				throw err;
			}

			res.status(200).json(result);
		});
	} else {
		res.status(500);
	}
}

module.exports = {
	getAllGarage,
	addNewGarage,
	editGarage,
	removeGarage,
	getAllCoach,
	addNewCoach,
	editCoach,
	removeCoach,
	getAllUser,
	addNewUser,
	editUser,
	removeUser,
	getAllSchedule,
	getSearchSuggestions,
	getSearch,
	getTicketById,
	getNameGarage,
	getTicketParameter,
	addNewSchedule,
	getTypeCoach,
	getSimpleCoach,
	getFigures,
};
