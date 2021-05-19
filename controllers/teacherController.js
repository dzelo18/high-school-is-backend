const e = require('express');
var db = require('../db.js');

exports.assignGrade = function (req, res) {
    let sql = 'INSERT INTO Grade (grade, date, studentID, teacherID, courseID) VALUES (?, ?, ?, ?)';
    db.query(sql, [req.body.grade, req.body.date, req.body.studentId, req.body.teacherId, req.body.courseId], (err, result) => {
        if(err) {
            res.status(500).json({errorMessage: err.message});
        } else {
            console.log(result);
            res.status(200).json(result);
        }
    });
};

exports.assignAttendance = function (req, res) {
    let sql = 'INSERT INTO Attendance (date, justified, studentID, teacherID, courseID) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [req.body.date, req.body.justified, req.body.studentId, req.body.teacherId, req.body.courseId], (err, result) => {
        if(err) {
            res.status(500).json({errorMessage: err.message});
        } else {
            console.log(result);
            res.status(200).json(result);
        }
    });
};

exports.createAssignment = function (req, res) {
    let sql = 'INSERT INTO Assignment (title, description, date, isGlobal, userID, classID, courseID) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [req.body.title, req.body.description, req.body.date, req.body.isGlobal, req.body.userId, req.body.classId, req.body.courseId], (err, result) => {
        if(err) {
            res.status(500).json({errorMessage: err.message});
        } else {
            console.log(result);
            res.status(200).json(result);
        }
    });
};