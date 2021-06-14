const e = require('express');
var db = require('../db.js');
const utils = require('../utils/resUtils');

const encryptionUtils = require('../utils/encryptionUtils');

exports.getCourses = function (req, res) {
    let sql = 'SELECT * FROM Course WHERE Course.courseID IN (SELECT courseID FROM CourseSelections WHERE studentID=?)';
    let id = encryptionUtils.decrypt(req.params.id);
    db.query(sql, [id], (err, result) => {
        if(err) {
            res.status(500).send(utils.buildResponse("error", {}, err.message));
        } else {
            res.status(200).send(utils.buildResponse("success", result, ""));
        }
    });
};

exports.getTimetableForStudent = function (req, res) {
    let sql = `SELECT t.slot, t.day, t.courseID, c.name as courseName
	FROM Timetable as t, Course as c, CourseSelections as cs 
	WHERE t.courseID=c.courseID and cs.courseID=c.courseID and cs.studentID=?`;
    let id = encryptionUtils.decrypt(req.params.id);
    db.query(sql, [id], (err, result) => {
        if(err) {
            res.status(500).send(utils.buildResponse("error", {}, err.message));
        } else {
            res.status(200).send(utils.buildResponse("success", result, ""));
        }
    });
};

exports.getAssignmentsForStudent = function (req, res) {
    let sql = `SELECT * FROM Assignment WHERE Assignment.classID = (SELECT classID FROM Student WHERE Student.userID = ?) 
    AND Assignment.courseID IN (SELECT courseID FROM CourseSelections WHERE studentID=?)`;
    let id = encryptionUtils.decrypt(req.params.id);
    db.query(sql, [id, id], (err, result) => {
        if(err) {
            res.status(500).send(utils.buildResponse("error", {}, err.message));
        } else {
            res.status(200).send(utils.buildResponse("success", result, ""));
        }
    });
};

exports.getGradesForStudent = function (req, res) {
    console.log("ARRIVED AT STUDENT MIDDLEWARE!");
    let sql = `SELECT * FROM Grade WHERE studentID = ? AND courseID IN (SELECT courseID FROM CourseSelections WHERE studentID=?)`;
    let id = encryptionUtils.decrypt(req.params.id);
    db.query(sql, [id, id], (err, result) => {
        if(err) {
            return res.status(500).send(utils.buildResponse("error", {}, err.message));
        } else {
            return res.status(200).send(utils.buildResponse("success", result, ""));
        }
    });
};

exports.getAverageGradeForStudent = function (req, res, next) {
	req.statistics = {};
    let sql = `SELECT grade FROM Grade WHERE studentID = ?`;
    let id = encryptionUtils.decrypt(req.params.id);
    db.query(sql, [id], (err, result) => {
        if(err) {
            res.status(500).send(utils.buildResponse("error", {}, err.message));
        } else {
            let nrOfGrades = result.length;
            let sum = 0;

            for(let i=0; i<nrOfGrades; i++) sum += result[i].grade;
            let average = sum / nrOfGrades;
			req.statistics.average = average;
			next();
        }
    });
}

exports.getMaximumGradeForStudent = function (req, res, next) {
    let sql = `SELECT Grade.grade, Course.name FROM Grade,Course WHERE studentID = ? AND Grade.courseID=Course.courseID ORDER BY Grade.grade DESC LIMIT 1`;
    let id = encryptionUtils.decrypt(req.params.id);
    db.query(sql, [id], (err, result) => {
        if(err) {
            res.status(500).send(utils.buildResponse("error", {}, err.message));
        } else {
			req.statistics.maxGrade = result[0].grade;
			req.statistics.maxSubject = result[0].name;
			next();
        }
    });
}

exports.getMinimumGradeForStudent = function (req, res, next) {
    let sql = `SELECT Grade.grade, Course.name FROM Grade,Course WHERE studentID = ? AND Grade.courseID=Course.courseID ORDER BY Grade.grade ASC LIMIT 1`;
    let id = encryptionUtils.decrypt(req.params.id);
    db.query(sql, [id], (err, result) => {
        if(err) {
            res.status(500).send(utils.buildResponse("error", {}, err.message));
        } else {
			req.statistics.minGrade = result[0].grade;
			req.statistics.minSubject = result[0].name;
			next();
        }
    });
}

exports.getLatestGradeForStudent = function (req, res, next) {
    let sql = `SELECT Grade.grade, Course.name, Grade.date FROM Grade,Course WHERE studentID = ? AND Grade.courseID=Course.courseID ORDER BY Grade.date DESC LIMIT 1`;
    let id = encryptionUtils.decrypt(req.params.id);
    db.query(sql, [id], (err, result) => {
        if(err) {
            res.status(500).send(utils.buildResponse("error", {}, err.message));
        } else {
			req.statistics.latestGrade = result[0].grade;
			req.statistics.latestSubject = result[0].name;
			next();
        }
    });
}

exports.getAttendanceForStudent = function (req, res) {
    let sql = `SELECT * FROM Attendance WHERE studentID = ? AND courseID IN (SELECT courseID FROM CourseSelections WHERE studentID=?)`;
    let id = encryptionUtils.decrypt(req.params.id);
    db.query(sql, [id, id], (err, result) => {
        if(err) {
            return res.status(500).send(utils.buildResponse("error", {}, err.message));
        } else {
			req.statistics.attendance = result.length;
			req.statistics.unjustified = 0;
			for(let i=0; i<result.length; i++){
				if(!result[i].justified) req.statistics.unjustified++;
			}
            res.status(200).send(utils.buildResponse("success", req.statistics, ""));
        }
    });
};

exports.getCourseAttendanceForStudent = function (req, res) {
    let sql = `SELECT * FROM Attendance WHERE studentID = ? AND courseID = ?`;
    let id = encryptionUtils.decrypt(req.params.id);
    db.query(sql, [id, req.params.courseId], (err, result) => {
        if(err) {
            res.status(500).send(utils.buildResponse("error", {}, err.message));
        } else {
			req.statistics.attendance = result.length;
			req.statistics.unjustified = 0;
			for(let i=0; i<result.length; i++){
				if(!result[i].justified) req.statistics.unjustified++;
			}
            res.status(200).send(utils.buildResponse("success", req.statistics, ""));
        }
    });
};

exports.getCourseGradesForStudent = function (req, res) {
    let sql = `SELECT * FROM Grade WHERE studentID = ? AND courseID = ?`;
    let id = encryptionUtils.decrypt(req.params.id);
    db.query(sql, [id, id, req.params.courseId], (err, result) => {
        if(err) {
            res.status(500).send(utils.buildResponse("error", {}, err.message));
        } else {
            res.status(200).send(utils.buildResponse("success", result, ""));
        }
    });
};

exports.getCourseAssignmentsForStudent = function (req, res) {
    let sql = `SELECT * FROM Assignment WHERE Assignment.classID = (SELECT classID FROM Student WHERE Student.userID = ?) 
    AND Assignment.courseID = ?`;
    let id = encryptionUtils.decrypt(req.params.id);
    db.query(sql, [id, req.params.courseId], (err, result) => {
        if(err) {
            res.status(500).send(utils.buildResponse("error", {}, err.message));
        } else {
            res.status(200).send(utils.buildResponse("success", result, ""));
        }
    });
};
