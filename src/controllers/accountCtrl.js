const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const accountModel = require('../models/accountModel');

let VERIFY_CODE = null;

const hashPassword = (password) => {
	return jwt.sign(password, 'secret', { algorithm: 'HS256' });
};

const createToken = (content) => {
	return jwt.sign(content, 'secret', { expiresIn: '1h' });
};

const formatDateYMD = (date) => {
	const datePart = date.match(/\d+/g),
		year = datePart[0],
		month = datePart[1],
		day = datePart[2];

	return year + '-' + month + '-' + day;
};

const formatDateDMY = (date) => {
	const datePart = date.match(/\d+/g),
		year = datePart[0],
		month = datePart[1],
		day = datePart[2];

	return day + ' / ' + month + ' / ' + year;
};

function getToken(req, res) {
	const email = req.query.email;

	accountModel.getUserByEmail(email, (err, result) => {
		if (err) throw err;

		if (result.length === 0) {
			res.status(200).send({ token: '' });
		} else {
			const token = createToken({
				id: result[0].user_id,
				name: result[0].name,
				email: result[0].email,
				role: result[0].role,
			});

			res.status(200).send({ token });
			return;
		}
	});
}

function getVerify(req, res) {
	const username = req.query.username;

	accountModel.getEmailByUsername(username, (err, result) => {
		if (err) throw err;

		if (result.length === 0) {
			res.status(200).send({ message: 'Username not found' });
		} else {
			const email = result[0].email;

			const transporter = nodemailer.createTransport({
				host: 'smtp.gmail.com',
				port: 465,
				secure: true,
				auth: {
					user: 'nguyentrongquy260902@gmail.com',
					pass: 'baagtbarvjbibmbj',
				},
			});

			VERIFY_CODE = Math.floor(Math.random() * 1000000);

			const mailOptions = {
				from: '"Coach Booking" <nguyentrongquy260902@gmail.com>',
				to: email,
				subject: 'Coach Booking - Verify your email',
				text: 'Verify your email',
				html: `<div
				style="border: 1px solid #ccc; width: 500px; max-width: 90%; padding: 16px; border-radius: 10px; color: #111; margin: 0 auto;">
				<h3 style="width: 100%; text-align: center;">Coach Booking</h3>
				<h2 style="width: 100%; text-align: center; border-bottom: 1px solid #ccc; padding-bottom: 36px;">Xác minh khôi
					phục mật khẩu của bạn
				</h2>
				<p>Coach Booking đã nhận được yêu cầu của <span style="font-style: bold;">${email}</span> khôi phục lại mật khẩu của bạn.</p>
				<p>Sử dụng mã này để hoàn tất việc xác minh khôi phục mật khẩu của bạn:</p>
				<h1 style="width: 100%; text-align: center">${VERIFY_CODE}</h1>
				<p>Mã này sẽ hết hạn sau 2 phút.</p>
				<p>Nếu bạn không nhận ra <span style="font-style: bold;">${email}</span>, bạn có thể yên tâm bỏ qua email này.</p>
			</div>`,
			};

			transporter.sendMail(mailOptions, (error, info) => {
				if (error) {
					console.log(error);
					res.status(500).send("error: 'Failed to send email");
				} else {
					console.log('Message sent:', info.response);

					setTimeout(() => {
						VERIFY_CODE = null;
					}, 120000);

					res.status(200).send({ message: 'Email sent' });
				}
			});
		}
	});
}

function submitVerify(req, res) {
	const verifyCode = +req.body.verifyCode;

	if (verifyCode === VERIFY_CODE) {
		res.status(200).send({ message: 'Verified' });
	} else {
		res.status(200).send({ message: 'Wrong verify code' });
	}
}

function resetPassword(req, res) {
	const username = req.body.username;
	const password = req.body.password;

	// hash password sh 256
	const newPassword = hashPassword(password);

	accountModel.changePassword([username, newPassword], (err, result) => {
		if (err) throw err;

		res.status(200).send({ message: 'Password changed' });
	});
}

function login(req, res) {
	const username = req.body.username;
	const password = req.body.password;

	// hash password sh 256
	const passwordHashed = hashPassword(password);

	accountModel.login([username, passwordHashed], (err, result) => {
		if (err) throw err;

		if (result.length === 0) {
			res.status(200).send({ token: '' });
		} else {
			const token = createToken({
				id: result[0].user_id,
				name: result[0].name,
				email: result[0].email,
				role: result[0].role,
			});

			res.status(200).send({ token });
			return;
		}
	});
}

function register(req, res) {
	const username = req.body.username;
	const password = req.body.password;

	// Check if email or phone already exists
	accountModel.isEmailExist(username, (err, emailResult) => {
		if (err) throw err;

		accountModel.isPhoneExist(username, (err, phoneResult) => {
			if (err) throw err;

			if (emailResult.length !== 0) {
				res.status(200).send({
					message: { email: 'Địa chỉ email này đã được đăng ký' },
				});
			} else if (phoneResult.length !== 0) {
				res.status(200).send({
					message: { phone: 'Số điện thoại này đã được đăng ký' },
				});
			} else {
				// Neither email nor phone exists, proceed to register
				const passwordHashed = hashPassword(password);

				accountModel.register(
					[username, passwordHashed],
					(err, result) => {
						if (err) throw err;

						res.status(200).send({ message: 'Registered' });
					}
				);
			}
		});
	});
}

function completeRegister(req, res) {
	const name = req.body.name;
	const dateOfBirth = req.body.dateOfBirth;
	const gender = req.body.gender;
	const email = req.body.email;
	const phone = req.body.phone;
	const citizenIdentification = req.body.citizenIdentification;
	const city = req.body.city;
	const district = req.body.district;
	const formattedDate = formatDateYMD(dateOfBirth);

	const form = [
		name,
		formattedDate,
		gender,
		email,
		phone,
		citizenIdentification,
		city,
		district,
	];

	// Check if email or phone already exists
	accountModel.isEmailExist(email, (err, emailResult) => {
		if (err) throw err;

		accountModel.isPhoneExist(phone, (err, phoneResult) => {
			if (err) throw err;

			if (emailResult.length !== 0) {
				res.status(200).send({
					message: { email: 'Địa chỉ email này đã được đăng ký' },
				});
			} else if (phoneResult.length !== 0) {
				res.status(200).send({
					message: { phone: 'Số điện thoại này đã được đăng ký' },
				});
			} else {
				// Neither email nor phone exists, proceed to add the new user
				accountModel.addNewUser(form, (err, result) => {
					if (err) throw err;

					accountModel.linkAccountWithUser(
						[email, phone],
						(err, result) => {
							if (err) throw err;

							accountModel.getUserByEmail(
								email,
								(err, result) => {
									if (err) throw err;

									if (result.length === 0) {
										res.status(200).send({ token: '' });
									} else {
										const token = createToken({
											id: result[0].user_id,
											name: result[0].name,
											email: result[0].email,
											role: result[0].role,
										});

										res.status(200).send({ token });
										return;
									}
								}
							);
						}
					);
				});
			}
		});
	});
}

module.exports = {
	getToken,
	getVerify,
	submitVerify,
	resetPassword,
	login,
	register,
	completeRegister,
};
