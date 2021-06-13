const jwt = require('jsonwebtoken');
const yup = require('yup');
const sha256 = require('sha256');
const db = require('../db.js');
const crypto = require('crypto');
const utils = require('../utils/resUtils');
const encryptionUtils = require('../utils/encryptionUtils');

let secret = process.env.TOKEN_SECRET;

const credentialSchema = yup.object({
	email: yup.string().required(),
	password: yup.string().required()
});

exports.authorizeRequest = function(req, res, next) {
	let header = req.headers['authorization'];
	if (!header) res.status(401).send(utils.buildResponse("ERROR", {}, "Unauthorized Request!"));

	const token = header.split(' ')[1];
	if (!token) res.status(401).send(utils.buildResponse("ERROR", {}, "Unauthorized Request!"));

	jwt.verify(token, secret, (err, data) => {
		if (err) res.status(401).send(utils.buildResponse("ERROR", {}, "Could not validate token!"));
		let userID = data.user;
		if (!userID) res.status(401).send(utils.buildResponse("ERROR", {}, "Invalid token type!"));
		let sql = 'SELECT COUNT(*) AS accountCount FROM USER WHERE userID=?';
		db.query(sql, [userID], (err, result) => {
			if (err) res.status(500).json({ response: err.message });
			if (result[0].accountCount == 0) res.status(401).send(utils.buildResponse("ERROR", {}, "Cannot authenticate user from token!"));
		});
		next();
	});
}

exports.signup = async function(req, res) {
	let body = req.body;

	let accCredentials = body.credentials;

	try {
		if (!credentialSchema.isValidSync(accCredentials)) {
			throw new Error("Invalid data format supplied!");
        }
        
		let userId;
		let hashedPassword = sha256(accCredentials.password);

		let sql = `INSERT INTO User (role, username, password) VALUES ("student", ?, ?)`;

		await db.promise().query(sql, [accCredentials.email, hashedPassword]).then(([rows, fields]) => {
			utils.buildResponse("OK" , {}, "User registered succesfully!")
			userId = rows.insertId;
		}).catch((err) => {
			throw new Error(err);
		});
	} catch (ex) {
		res.status(400).send(utils.buildResponse("ERROR", {}, ex.message));
	}
}

exports.signIn = async function(req, res) {
	let body = req.body;
	let accCredentials = body.credentials;

	try {

		if (!credentialSchema.isValidSync(accCredentials)) {
			throw new Error("Invalid data format supplied!");
		}

		let sql = 'SELECT * FROM User WHERE username=? AND password=?'
		let hashedPassword = sha256(accCredentials.password);

		let userId;

		await db.promise().query(sql, [accCredentials.email, hashedPassword]).then(([rows, fields]) => {
            if(rows.length == 0) throw new Error("No user was found with the provided credentials!");
            userId = rows[0]['userID'];
		}).catch((err) => {
			throw new Error(err);
		});

		let tokenIdentifier = crypto.randomBytes(16).toString('hex');
		req.session.tokId = tokenIdentifier;
		req.session.userId = userId;

		let accessToken = jwt.sign({ user: encryptionUtils.encrypt(userId) }, secret, { expiresIn: '1h' });
		let refreshToken = jwt.sign({ tokenId: tokenIdentifier }, secret, { expiresIn: '1h' });

		res.cookie("refresh_token", JSON.stringify({
			token: refreshToken,
		}), {
			httpOnly: true,
		});

        res.status(201).send(utils.buildResponse("OK", {token: accessToken, userID: encryptionUtils.encrypt(userId)}, "User authenticated succesffully!"));
	} catch (ex) {
		res.status(400).send(utils.buildResponse("ERROR", {}, ex.message));
	}

}

exports.refreshToken = function(req, res) {
	//let body = req.body;

	(async () => {
		try {
			let tokenIdentifier = req.session.tokId;
			let userId = req.session.userId;
			let refreshToken = JSON.parse(req.cookies.refresh_token);
			console.log(refreshToken);
			console.log(refreshToken.token);
			if (!refreshToken) throw new Error('Could not retrieve refresh token!');

			jwt.verify(refreshToken.token, secret, (err, data) => {
				if (err) throw new Error(err.message);
				if (data.tokenId != tokenIdentifier) throw new Error('Could not authorize session!');
			});

			let newTokenIdentifier = crypto.randomBytes(16).toString('hex');
			req.session.tokId = newTokenIdentifier;

			let newAccessToken = jwt.sign({ user: userId }, secret, { expiresIn: '1h' })
			let newRefreshToken = jwt.sign({ tokenId: newTokenIdentifier, user: email }, secret, { expiresIn: '1h' });

			res.cookie("refresh_token", JSON.stringify({
				token: newRefreshToken
			}), {
				httpOnly: true,
			});

            res.status(201).send(utils.buildResponse("OK", {token: newAccessToken}, "Token refreshed successfully!"));
		} catch (ex) {
			res.status(400).send(utils.buildResponse("ERROR", {}, ex.message));
		}

	})();

}
