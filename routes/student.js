var express = require('express');
var router = express.Router();

// Require controller module
var studentController = require('../controllers/studentController.js');
const { route } = require('../index.js');

router.get('/{id}/courses', studentController.getCoursesForStudent);
route.get('/{id}/timetable', studentController.getTimetableForStudent);
route.get('/{id}/assignments', studentController.getAssignmentsForStudent);
route.get('/{id}/attendance', studentController.getAttendanceForStudent);
route.get('/{id}/grades', studentController.getGradesForStudent);



module.exports = router;