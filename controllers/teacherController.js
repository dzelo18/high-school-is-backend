const e = require('express');
var db = require('../db.js');
const utils = require('../utils/resUtils');
const encryptUtils = require('../utils/encryptionUtils');

exports.assignGrade = function (req, res) {
    if(res.locals.role != 'teacher') res.status(500).send(utils.buildResponse("error", {}, "Unauthorized Request!"));
    let teacherId = encryptUtils.decrypt(req.body.teacherID);
    let sql = 'INSERT INTO Grade (grade, date, studentID, teacherID, courseID) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [req.body.grade, req.body.date, req.body.studentID, teacherId, req.body.courseID], (err, result) => {
        if(err) {
            res.status(500).send(utils.buildResponse("error", {}, err.message));
        } else {
            res.status(200).send(utils.buildResponse("ok", result, "Grade updated successfully!"));
        }
    });
};

exports.assignAttendance = function (req, res) {
    if(res.locals.role != 'teacher') res.status(500).send(utils.buildResponse("error", {}, "Unauthorized Request!"));
    let teacherId = encryptUtils.decrypt(req.body.teacherID);
    let sql = 'INSERT INTO Attendance (date, justified, studentID, teacherID, courseID) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [req.body.date, req.body.justified, req.body.studentID, teacherId, req.body.courseID], (err, result) => {
        if(err) {
            res.status(500).send(utils.buildResponse("error", {}, err.message));
        } else {
            res.status(200).send(utils.buildResponse("ok", result, "Attendance updated successfully!"));
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

exports.getTeacherName = function (req, res, next) {
    if(res.locals.role != 'teacher') res.status(500).send(utils.buildResponse("error", {}, "Unauthorized Request!"));
    req.teacherData = {}
    let teacherId = encryptUtils.decrypt(req.body.userId);
    let sql = 'SELECT * FROM Teacher WHERE userID=?';
    db.query(sql, [teacherId], (err, result) => {
        if(err) {
            res.status(500).send(utils.buildResponse("error", {}, err.message));
        } else {
            if(result.length != 1) res.status(500).send(utils.buildResponse("error", {}, "Couldn't retrieve data for the requested teacher"));
            req.teacherData.firstname = result[0].name;
            req.teacherData.lastname = result[0].surname;
            next();
            //res.status(200).send(utils.buildResponse("success", result, "Assignment inserted successfully!"));
        }
    });
}

exports.getTeacherCourses = function (req, res) {
    if(res.locals.role != 'teacher') res.status(500).send(utils.buildResponse("error", {}, "Unauthorized Request!"));
    let teacherId = encryptUtils.decrypt(req.body.userId);
    let sql = 'SELECT * FROM TaughtCourse NATURAL JOIN Course NATURAL JOIN Class WHERE TaughtCourse.teacherID=?';
    db.query(sql, [teacherId], (err, result) => {
        if(err) {
            res.status(500).send(utils.buildResponse("error", {}, err.message));
        } else {
            if(result.length == 0) res.status(500).send(utils.buildResponse("error", {}, "Couldn't retrieve data for the requested teacher"));
            let subjectData = [];
            for(let i=0; i<result.length; i++){
                subjectData[i] = {
                    course: result[i].name,
                    class: `${result[i].grade}-${result[i].letter}`
                }
            }
            req.teacherData.courses = subjectData;
            res.status(200).send(utils.buildResponse("ok", req.teacherData, "Data retrieved successfully!"));
        }
    });
}

exports.getTeacherCourseData = function (req, res) {
    if(res.locals.role != 'teacher') res.status(500).send(utils.buildResponse("error", {}, "Unauthorized Request!"));
    let teacherId = encryptUtils.decrypt(req.body.userId);
    let sql = 'SELECT DISTINCT courseID, name FROM TaughtCourse NATURAL JOIN Course WHERE teacherID=?';
    db.query(sql, [teacherId], (err, result) => {
        if(err) {
            res.status(500).send(utils.buildResponse("error", {}, err.message));
        } else {
            if(result.length == 0) res.status(500).send(utils.buildResponse("error", {}, "Couldn't retrieve data for the requested teacher"));
            let courseData = [];
            for(let i=0; i<result.length; i++){
                courseData[i] = {
                    id: result[i].courseID,
                    course: `${result[i].name}`
                }
            }
            res.status(200).send(utils.buildResponse("ok", courseData, "Data retrieved successfully!"));
        }
    });
}

exports.getTeacherStudents = function (req, res) {
    if(res.locals.role != 'teacher') res.status(500).send(utils.buildResponse("error", {}, "Unauthorized Request!"));
    let teacherId = encryptUtils.decrypt(req.body.userId);
    let sql = 'SELECT * FROM Student WHERE Student.userID IN (SELECT studentID FROM CourseSelections WHERE courseID IN (SELECT courseID FROM TaughtCourse WHERE teacherID=?) )';
    db.query(sql, [teacherId], (err, result) => {
        if(err) {
            res.status(500).send(utils.buildResponse("error", {}, err.message));
        } else {
            if(result.length == 0) res.status(500).send(utils.buildResponse("error", {}, "Couldn't retrieve data for the requested teacher"));
            let studentData = [];
            for(let i=0; i<result.length; i++){
                studentData[i] = {
                    name: `${result[i].name} ${result[i].surname}`,
                    studentID: `${result[i].userID}` 
                }
            }
            res.status(200).send(utils.buildResponse("ok", studentData, "Data retrieved successfully!"));
        }
    });
}