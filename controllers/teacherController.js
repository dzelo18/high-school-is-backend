const e = require('express');
var db = require('../db.js');
const utils = require('../utils/resUtils');
const encryptUtils = require('../utils/encryptionUtils');

exports.assignGrade = function (req, res) {
    if(res.locals.role != 'teacher') res.status(500).send(utils.buildResponse("error", {}, "Unauthorized Request!"));
    let teacherId = encryptUtils.decrypt(req.body.teacherId);
    let sql = 'INSERT INTO Grade (grade, date, studentID, teacherID, courseID) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [req.body.grade, req.body.date, req.body.studentId, teacherId, req.body.courseId], (err, result) => {
        if(err) {
            res.status(500).send(utils.buildResponse("error", {}, err.message));
        } else {
            res.status(200).send(utils.buildResponse("success", result, "Grade updated successfully!"));
        }
    });
};

exports.assignAttendance = function (req, res) {
    if(res.locals.role != 'teacher') res.status(500).send(utils.buildResponse("error", {}, "Unauthorized Request!"));
    let teacherId = encryptUtils.decrypt(req.body.teacherId);
    let sql = 'INSERT INTO Attendance (date, justified, studentID, teacherID, courseID) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [req.body.date, req.body.justified, req.body.studentId, teacherId, req.body.courseId], (err, result) => {
        if(err) {
            res.status(500).send(utils.buildResponse("error", {}, err.message));
        } else {
            res.status(200).send(utils.buildResponse("success", result, "Attendance updated successfully!"));
        }
    });
};

exports.createAssignment = function (req, res) {
    if(res.locals.role != 'teacher') res.status(500).send(utils.buildResponse("error", {}, "Unauthorized Request!"));
    let teacherId = encryptUtils.decrypt(req.body.userId);
    let sql = 'INSERT INTO Assignment (title, description, date, isGlobal, userID, classID, courseID) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [req.body.title, req.body.description, req.body.date, req.body.isGlobal, teacherId, req.body.classId, req.body.courseId], (err, result) => {
        if(err) {
            res.status(500).send(utils.buildResponse("error", {}, err.message));
        } else {
            res.status(200).send(utils.buildResponse("success", result, "Assignment inserted successfully!"));
        }
    });
};