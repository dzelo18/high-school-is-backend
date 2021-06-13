const e = require('express');
var db = require('../db.js');
const utils = require('../utils/resUtils');

exports.assignGrade = function (req, res) {
    let sql = 'INSERT INTO Grade (grade, date, studentID, teacherID, courseID) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [req.body.grade, req.body.date, req.body.studentId, req.body.teacherId, req.body.courseId], (err, result) => {
        if(err) {
            res.status(500).send(utils.buildResponse("error", {}, err.message));
        } else {
            res.status(200).send(utils.buildResponse("success", result, "Grade updated successfully!"));
        }
    });
};

exports.assignAttendance = function (req, res) {
    let sql = 'INSERT INTO Attendance (date, justified, studentID, teacherID, courseID) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [req.body.date, req.body.justified, req.body.studentId, req.body.teacherId, req.body.courseId], (err, result) => {
        if(err) {
            res.status(500).send(utils.buildResponse("error", {}, err.message));
        } else {
            res.status(200).send(utils.buildResponse("success", result, "Attendance updated successfully!"));
        }
    });
};

exports.createAssignment = function (req, res) {
    let sql = 'INSERT INTO Assignment (title, description, date, isGlobal, userID, classID, courseID) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [req.body.title, req.body.description, req.body.date, req.body.isGlobal, req.body.userId, req.body.classId, req.body.courseId], (err, result) => {
        if(err) {
            res.status(500).send(utils.buildResponse("error", {}, err.message));
        } else {
            res.status(200).send(utils.buildResponse("success", result, "Assignment inserted successfully!"));
        }
    });
};