const e = require('express');
var db = require('../db.js');

exports.getCourses = function (req, res) {
    let sql = 'SELECT * FROM Course WHERE Course.courseID IN (SELECT courseID FROM CourseSelections WHERE studentID=?)';
    db.query(sql, [req.params.id], (err, result) => {
        if(err) {
            res.status(500).json({errorMessage: err.message});
        } else {
            console.log(result);
            res.status(200).json(result);
        }
    });
};

exports.getTimetableForStudent = function (req, res) {
    let sql = 'SELECT * FROM Timetable WHERE Timetable.courseID IN (SELECT courseID FROM CourseSelections WHERE studentID=?)';
    db.query(sql, [req.params.id], (err, result) => {
        if(err) {
            res.status(500).json({errorMessage: err.message});
        } else {
            console.log(result);
            res.status(200).json(result);
        }
    });
};

exports.getAssignments = function (req, res) {
    let sql = `SELECT * FROM Assignment WHERE Assignment.classID = (SELECT classID FROM Student WHERE Student.userID = ?) 
    AND Assignment.courseID IN (SELECT courseID FROM CourseSelections WHERE studentID=?)`;
    db.query(sql, [req.params.id, req.params.id], (err, result) => {
        if(err) {
            res.status(500).json({errorMessage: err.message});
        } else {
            console.log(result);
            res.status(200).json(result);
        }
    });
};

exports.getAttendanceForStudent = function (req, res) {
    let sql = `SELECT * FROM Attendance WHERE studentID = ? AND courseID IN (SELECT courseID FROM CourseSelections WHERE studentID=?)`;
    db.query(sql, [req.params.id, req.params.id], (err, result) => {
        if(err) {
            console.log(err.message);
            res.status(500).json({errorMessage: err.message});
        } else {
            console.log(result);
            res.status(200).json(result);
        }
    });
};

exports.getGradesForStudent = function (req, res) {
    let sql = `SELECT * FROM Grades WHERE studentID = ? AND courseID IN (SELECT courseID FROM CourseSelections WHERE studentID=?)`;
    db.query(sql, [req.params.id, req.params.id], (err, result) => {
        if(err) {
            console.log(err.message);
            res.status(500).json({errorMessage: err.message});
        } else {
            console.log(result);
            res.status(200).json(result);
        }
    });
};