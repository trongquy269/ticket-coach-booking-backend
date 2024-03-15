const notifyModel = require('../models/notifyModel');

let IS_UNDO = false;

function undoTimeOut(time, callback) {
	IS_UNDO = false;

	setTimeout(() => {
		if (!IS_UNDO) {
			callback();
		}
	}, time);
}

function getNotifies(req, res) {
	const userId = req.query.userId;

	notifyModel.getNotifiesByUserId(userId, (err, result) => {
		if (err) throw err;

		if (result.length === 0) {
			res.status(200).send({ message: 'No notify found' });
		} else {
			res.status(200).send(result);
		}
	});
}

function changeState(req, res) {
	const userId = req.body.userId;
	const notifyId = req.body.id;
	const type = req.body.type;

	const handle = (id) => {
		if (type === 'seen') {
			notifyModel.seenNotify([userId, id], (err, result) => {
				if (err) throw err;
				return true;
			});
		} else {
			notifyModel.unSeenNotify([userId, id], (err, result) => {
				if (err) throw err;
				return true;
			});
		}
	};

	if (typeof notifyId === 'number') {
		undoTimeOut(5000, () => handle(notifyId));

		res.status(200).send({ message: 'success' });
	} else {
		undoTimeOut(5000, () => {
			notifyId.forEach((id) => {
				handle(id);
			});
		});

		res.status(200).send({ message: 'success' });
	}
}

function deleteNotifies(req, res) {
	const userId = req.body.userId;
	const notifyId = req.body.id;

	const handle = (id) => {
		notifyModel.deleteNotify([userId, id], (err, result) => {
			if (err) throw err;
			return true;
		});
	};

	if (typeof notifyId === 'number') {
		undoTimeOut(5000, () => handle(notifyId));

		res.status(200).send({ message: 'success' });
	} else {
		undoTimeOut(5000, () => {
			notifyId.forEach((id) => {
				handle(id);
			});
		});

		res.status(200).send({ message: 'success' });
	}
}

function undo(req, res) {
	IS_UNDO = true;
}

function seenHandler(req, res) {
	const userId = req.body.userId;
	const notifyId = req.body.notifyId;

	notifyModel.seenNotify([userId, (id = notifyId)], (err, result) => {
		if (err) throw err;

		res.status(200).send({ message: 'success' });
	});
}

module.exports = {
	getNotifies,
	changeState,
	deleteNotifies,
	undo,
	seenHandler,
};
