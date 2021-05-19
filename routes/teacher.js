var express = require('express');
var router = express.Router();

// Require controller module
var studentController = require('../controllers/teacherController.js');

router.post('/assignGrade', teacherController.assignGrade);
router.post('/assignAttendance', teacherController.assignAttendance);

module.exports = router;