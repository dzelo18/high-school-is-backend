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

exports.authorizeRequest = async function(req, res, next) {
	let header = req.headers['authorization'];
	if (!header) return res.status(401).send(utils.buildResponse("ERROR", {}, "Unauthorized Request!"));
	const token = header.split(' ')[1];
	if (!token) return res.status(401).send(utils.buildResponse("ERROR", {}, "Unauthorized Request!"));

	await jwt.verify(token, secret, (err, data) => {
		if (err) res.status(401).send(utils.buildResponse("ERROR", {}, "Could not validate token!"));
		let userID = data.user;
		if (!userID) return res.status(401).send(utils.buildResponse("ERROR", {}, "Invalid token type!"));
		let sql = "SELECT * FROM User WHERE userID=?"
		//let sql = 'SELECT COUNT(*) AS accountCount FROM User WHERE userID=?';
		db.query(sql, [userID], (err, result) => {
			if (err) return res.status(500).send(utils.buildResponse("error", {}, err.message));
			if (result.length != 1) return res.status(401).send(utils.buildResponse("ERROR", {}, "Cannot authenticate user from token!"));
			res.locals.role = result[0].role
			next();
		});
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
			userId = rows.insertId;
			res.status(200).send(utils.buildResponse("OK" , {}, "User registered succesfully!"));
			
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
		let role;

		await db.promise().query(sql, [accCredentials.email, hashedPassword]).then(([rows, fields]) => {
            if(rows.length == 0) throw new Error("No user was found with the provided credentials!");
            userId = rows[0]['userID'];
			role = rows[0]['role'];
		}).catch((err) => {
			throw new Error(err);
		});

		let tokenIdentifier = crypto.randomBytes(16).toString('hex');
		req.session.tokId = tokenIdentifier;
		req.session.userId = userId;
		req.session.role = role;

		let accessToken = jwt.sign({ user: userId }, secret, { expiresIn: '1h' });
		let refreshToken = jwt.sign({ tokenId: tokenIdentifier }, secret, { expiresIn: '1h' });

		res.cookie("refresh_token", JSON.stringify({
			token: refreshToken,
		}), {
			httpOnly: true,
		});

        res.status(201).send(utils.buildResponse("OK", {token: accessToken, userID: encryptionUtils.encrypt(userId), role: role}, "User authenticated succesffully!"));
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
			let role = req.session.role;
			console.log(req.cookies);
			if(!req.cookies.refresh_token) throw new Error('Could not retrieve refresh token!');
			
			let refreshToken = JSON.parse(req.cookies.refresh_token);

			jwt.verify(refreshToken.token, secret, (err, data) => {
				if (err) throw new Error(err.message);
				if (data.tokenId != tokenIdentifier) throw new Error('Could not authorize session!');
			});

			let newTokenIdentifier = crypto.randomBytes(16).toString('hex');
			req.session.tokId = newTokenIdentifier;

			let newAccessToken = jwt.sign({ user: userId }, secret, { expiresIn: '1h' })
			let newRefreshToken = jwt.sign({ tokenId: newTokenIdentifier, user: userId }, secret, { expiresIn: '1h' });

			res.cookie("refresh_token", JSON.stringify({
				token: newRefreshToken
			}), {
				httpOnly: true,
			});

            res.status(201).send(utils.buildResponse("OK", {token: newAccessToken, userID: encryptionUtils.encrypt(userId), role: role}, "Token refreshed successfully!"));
		} catch (ex) {
			return res.status(400).send(utils.buildResponse("ERROR", {}, ex.message));
		}

	})();

}
