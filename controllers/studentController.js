const e = require('express');
var db = require('../db.js');

const encryptionUtils = require('../utils/encryptionUtils');

exports.getCourses = function (req, res) {
    let sql = 'SELECT * FROM Course WHERE Course.courseID IN (SELECT courseID FROM CourseSelections WHERE studentID=?)';
    let id = encryptionUtils.decrypt(req.params.id);
    db.query(sql, [id], (err, result) => {
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
    let id = encryptionUtils.decrypt(req.params.id);
    db.query(sql, [id], (err, result) => {
        if(err) {
            res.status(500).json({errorMessage: err.message});
        } else {
            console.log(result);
            res.status(200).json(result);
        }
    });
};

exports.getAssignmentsForStudent = function (req, res) {
    let sql = `SELECT * FROM Assignment WHERE Assignment.classID = (SELECT classID FROM Student WHERE Student.userID = ?) 
    AND Assignment.courseID IN (SELECT courseID FROM CourseSelections WHERE studentID=?)`;
    let id = encryptionUtils.decrypt(req.params.id);
    db.query(sql, [id, id], (err, result) => {
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
    let id = encryptionUtils.decrypt(req.params.id);
    db.query(sql, [id, id], (err, result) => {
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
    let id = encryptionUtils.decrypt(req.params.id);
    db.query(sql, [id, id], (err, result) => {
        if(err) {
            console.log(err.message);
            res.status(500).json({errorMessage: err.message});
        } else {
            console.log(result);
            res.status(200).json(result);
        }
    });
};

exports.getCourseGradesForStudent = function (req, res) {
    let sql = `SELECT * FROM Grades WHERE studentID = ? AND courseID = ?`;
    let id = encryptionUtils.decrypt(req.params.id);
    db.query(sql, [id, id, req.params.courseId], (err, result) => {
        if(err) {
            console.log(err.message);
            res.status(500).json({errorMessage: err.message});
        } else {
            console.log(result);
            res.status(200).json(result);
        }
    });
};

exports.getCourseAttendanceForStudent = function (req, res) {
    let sql = `SELECT * FROM Attendance WHERE studentID = ? AND courseID = ?`;
    let id = encryptionUtils.decrypt(req.params.id);
    db.query(sql, [id, req.params.courseId], (err, result) => {
        if(err) {
            console.log(err.message);
            res.status(500).json({errorMessage: err.message});
        } else {
            console.log(result);
            res.status(200).json(result);
        }
    });
};

exports.getCourseAssignmentsForStudent = function (req, res) {
    let sql = `SELECT * FROM Assignment WHERE Assignment.classID = (SELECT classID FROM Student WHERE Student.userID = ?) 
    AND Assignment.courseID = ?`;
    let id = encryptionUtils.decrypt(req.params.id);
    db.query(sql, [id, req.params.courseId], (err, result) => {
        if(err) {
            res.status(500).json({errorMessage: err.message});
        } else {
            console.log(result);
            res.status(200).json(result);
        }
    });
};