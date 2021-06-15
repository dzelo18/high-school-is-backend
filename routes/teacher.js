var express = require('express');
var router = express.Router();

// Require controller module
var teacherController = require('../controllers/teacherController.js');

router.post('/teacherData', teacherController.getTeacherName, teacherController.getTeacherCourses);
router.post('/students', teacherController.getTeacherStudents);
router.post('/courses', teacherController.getTeacherCourseData);

router.post('/assignGrade', teacherController.assignGrade);
router.post('/assignAttendance', teacherController.assignAttendance);

module.exports = router;