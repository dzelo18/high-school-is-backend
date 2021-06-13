var express = require('express');
var router = express.Router();

// Require controller module
var studentController = require('../controllers/studentController.js');

router.get('/:id/courses', studentController.getCourses);
router.get('/:id/timetable', studentController.getTimetableForStudent);
router.get('/:id/assignments', studentController.getAssignmentsForStudent);
router.get('/:id/attendance', studentController.getAttendanceForStudent);
router.get('/:id/grades', studentController.getGradesForStudent);
router.get('/:id/courses/:courseId/grades', studentController.getCourseGradesForStudent);
router.get('/:id/courses/:courseId/average', studentController.getAverageGradeForStudent);
router.get('/:id/courses/:courseId/attendance', studentController.getCourseAttendanceForStudent);
router.get('/:id/courses/:courseId/assignments', studentController.getCourseAssignmentsForStudent);

module.exports = router;
