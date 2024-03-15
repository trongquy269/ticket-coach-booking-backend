const jwt = require('jsonwebtoken');
const managerModel = require('../models/managerModel');

const hashPassword = (password) => {
	return jwt.sign(password, 'secret', { algorithm: 'HS256' });
};

function getAllGarage(req, res) {
	managerModel.getAllGarage((err, result) => {
		if (err) throw err;

		if (result.length === 0) {
			res.status(200).message('No garage found');
		} else {
			res.status(200).send(result);
		}
	});
}

function addNewGarage(req, res) {
	const name = req.body.name.toUpperCase();
	const description = req.body.description || 'empty';

	// Check garage exist
	managerModel.getGarageByName(name, (err, result) => {
		if (err) throw err;

		if (result.length > 0) {
			res.status(200).send({ message: 'Garage already exist' });
		} else {
			managerModel.addNewGarage([name, description], (err, result) => {
				if (err) throw err;

				res.status(200).send({ message: 'success' });
			});
		}
	});
}

function editGarage(req, res) {
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
		if (err) throw err;

		res.status(200).send({ message: 'success' });
	});
}

function removeGarage(req, res) {
	const id = req.body.id;
	const reason = req.body.reason;

	managerModel.removeGarage(id, (err, result) => {
		if (err) throw err;

		res.status(200).send({ message: 'success' });
	});
}

function getAllCoach(req, res) {
	managerModel.getAllCoach((err, result) => {
		if (err) throw err;

		if (result.length === 0) {
			res.status(200).message('No coach found');
		} else {
			res.status(200).send(result);
		}
	});
}

function addNewCoach(req, res) {
	const vehicleNumber = req.body.vehicleNumber;
	const manufacturer = req.body.manufacturer;
	const licensePlate = req.body.licensePlate;
	const garageId = req.body.garageId;
	const typeId = req.body.typeId;
	const numberSeat = typeId === 2 ? 45 : 40;

	// Check coach exist
	managerModel.getCoachByVehicleNumber(licensePlate, (err, result) => {
		if (err) throw err;

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
					if (err) throw err;

					res.status(200).send({ message: 'success' });
				}
			);
		}
	});
}

function editCoach(req, res) {
	const id = req.body.id;
	let key = req.body.key;
	let value = req.body.value;

	if (key === 'vehicle_number') value = parseInt(value);
	if (key === 'garage') key = 'garage_id';

	managerModel.editCoach([id, key, value], (err, result) => {
		if (err) throw err;

		res.status(200).send({ message: 'success' });
	});
}

function removeCoach(req, res) {
	const id = req.body.id;
	const reason = req.body.reason;

	managerModel.removeCoach(id, (err, result) => {
		if (err) throw err;

		res.status(200).send({ message: 'success' });
	});
}

function getAllUser(req, res) {
	managerModel.getAllUser((err, result) => {
		if (err) throw err;

		if (result.length === 0) {
			res.status(200).message('No user found');
		} else {
			res.status(200).send(result);
		}
	});
}

function addNewUser(req, res) {
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
		if (err) throw err;

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
					if (_err) throw _err;

					res.status(200).send({ message: 'success' });
				}
			);
		}
	});
}

function editUser(req, res) {
	const phone = req.body.phone;
	const value = req.body.value.trim();
	let key = req.body.key;

	if (key === 'district') key = 'district_id';
	else if (key === 'city') key = 'accommodation';

	if (key !== 'phone') {
		managerModel.editUser([phone, key, value], (err, result) => {
			if (err) throw err;

			res.status(200).send({ message: 'success' });
		});
	} else {
		managerModel.editUser([phone, key, value], (err, result) => {
			if (err) throw err;

			// Check username is phone
			managerModel.checkUsernameIsPhone(phone, (err, _result) => {
				if (err) throw err;

				if (_result.length > 0) {
					const user_id = _result[0].user_id;
					managerModel.updateUsername(
						[value, user_id],
						(err, __result) => {
							if (err) throw err;

							res.status(200).send({ message: 'success' });
						}
					);
				} else {
					res.status(200).send({ message: 'success' });
				}
			});
		});
	}
}

function removeUser(req, res) {
	const id = req.body.id;
	const reason = req.body.reason;

	managerModel.removeUserById(id, (err, result) => {
		if (err) throw err;

		res.status(200).send({ message: 'success' });
	});
}

function getAllSchedule(req, res) {
	managerModel.getAllSchedule((err, result) => {
		if (err) throw err;

		if (result.length === 0) {
			res.status(200).message('No schedule found');
		} else {
			res.status(200).send(result);
		}
	});
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
};
