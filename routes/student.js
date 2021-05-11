var express = require('express');
var router = express.Router();

// Require controller module
var studentController = require('../controllers/StudentController.js');

router.get('/:id/courses', studentController.getCourses);
router.get('/:id/timetable', studentController.getTimetableForStudent);
router.get('/:id/assignments', studentController.getAssignments);
router.get('/:id/attendance', studentController.getAttendanceForStudent);
router.get('/:id/grades', studentController.getGradesForStudent);



module.exports = router;