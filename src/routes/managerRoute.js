const managerCtrl = require('../controllers/managerCtrl');

function managerRoute (app) {
	app.get('/manager-garage', managerCtrl.getAllGarage);
	app.post('/manager-garage', managerCtrl.addNewGarage);
	app.patch('/manager-garage', managerCtrl.editGarage);
	app.delete('/manager-garage', managerCtrl.removeGarage);
	app.get('/simple/manager-garage', managerCtrl.getNameGarage);

	app.get('/manager-coach', managerCtrl.getAllCoach);
	app.post('/manager-coach', managerCtrl.addNewCoach);
	app.patch('/manager-coach', managerCtrl.editCoach);
	app.delete('/manager-coach', managerCtrl.removeCoach);
	app.get('/manager-coach/type', managerCtrl.getTypeCoach);
	app.get('/manager-coach/simple', managerCtrl.getSimpleCoach);

	app.get('/manager-user', managerCtrl.getAllUser);
	app.post('/manager-user', managerCtrl.addNewUser);
	app.patch('/manager-user', managerCtrl.editUser);
	app.delete('/manager-user', managerCtrl.removeUser);

	app.get('/manager-schedule', managerCtrl.getAllSchedule);
	app.post('/manager-schedule', managerCtrl.addNewSchedule);
	// app.patch('/manager-schedule', managerCtrl.editSchedule);
	// app.delete('/manager-schedule', managerCtrl.removeSchedule);

	app.get('/manager-ticket', managerCtrl.getTicketById);
	app.get('/parameter/ticket', managerCtrl.getTicketParameter);

	app.get('/typing-search', managerCtrl.getSearchSuggestions);
	app.get('/search', managerCtrl.getSearch);
	
	app.get('/manager/figures', managerCtrl.getFigures);
}

module.exports = managerRoute;
