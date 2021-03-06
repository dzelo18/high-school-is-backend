var express = require('express');
var router = express.Router();

let authenticationController = require('../controllers/AuthenticationController.js');

router.post('/signin', authenticationController.signIn);
router.post('/signup', authenticationController.signup);
router.post('/refresh', authenticationController.refreshToken);

module.exports = router;
