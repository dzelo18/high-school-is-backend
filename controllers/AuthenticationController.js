const jwt = require('jsonwebtoken');
const yup = require('yup');
const bcrypt = require('bcrypt');
const db = require('../db.js');
const crypto = require('crypto');

let secret = process.env.TOKEN_SECRET;

const signUpSchema = yup.object({
	email: yup.string().required(),
	password: yup.string().required()
});

exports.signIn = async function(req, res) {
	let body = req.body;
	let accCredentials = body.credentials;

	try {

		if (!signUpSchema.isValidSync(accCredentials)) {
			throw new Error("Invalid data format supplied!");
		}

		let sql = 'SELECT * FROM User WHERE username=? AND password=?'
		//let hashedPassword = await bcrypt.hash(accCredentials.password, 10);

		let userId;

		await db.promise().query(sql, [accCredentials.email, accCredentials.password]).then(([rows, fields]) => {
            if(rows.length == 0) throw new Error("No user was found with the provided credentials!");
            userId = rows[0]['userID'];
		}).catch((err) => {
			throw new Error(err);
		});

		let tokenIdentifier = crypto.randomBytes(16).toString('hex');
		req.session.tokId = tokenIdentifier;
		req.session.userId = userId;

		let accessToken = jwt.sign({ user: userId }, secret, { expiresIn: '1h' });
		let refreshToken = jwt.sign({ tokenId: tokenIdentifier }, secret, { expiresIn: '1h' });

		res.cookie("refresh_token", JSON.stringify({
			token: refreshToken
		}), {
			httpOnly: true,
		});

		res.status(201).send({
			message: "User authenticated succesffully!",
			token: accessToken,
			accountData: {
				user: userId,
			}
		});

	} catch (ex) {
		res.status(400).json({ message: ex.message });
	}

}

exports.authorizeRequest = function(req, res, next) {
	let header = req.headers['authorization'];
	if (!header) res.status(401).send('Unauthorized Request!');

	const token = header.split(' ')[1];
	if (!token) res.status(401).send("Unauthorized Request!");

	jwt.verify(token, secret, (err, data) => {
		if (err) res.status(401).send("Couldn't validate token!");
		let userID = data.userID;
		if (!userID) res.status(401).send("Invalid Token!");
		let sql = 'SELECT COUNT(*) AS accountCount FROM USER WHERE userID=?';
		db.query(sql, [userID], (err, result) => {
			if (err) res.status(500).json({ response: err.message });
			if (result[0].accountCount == 0) res.status(401).send("Invalid supplied account!");
		});
		next();
	});
}

exports.signup = async function(req, res) {
	let body = req.body;

	let accountCredentials = body.credentials;

	try {
		if (!signUpSchema.isValidSync(accountCredentials)) {
			throw new Error("Invalid data format supplied!");
		}
		let userId;
		//let hashedPassword = await bcrypt.hash(accountCredentials.password, 10);

		let sql = `INSERT INTO User (role, username, password) VALUES ("student", ?, ?)`;

		await db.promise().query(sql, [accountCredentials.email, accountCredentials.password]).then(([rows, fields]) => {
			userId = rows.insertId;
		}).catch((err) => {
			throw new Error(err);
		});

		let tokenIdentifier = crypto.randomBytes(16).toString('hex');
		req.session.tokId = tokenIdentifier;
		req.session.userId = userId;

		let accessToken = jwt.sign({ user: userId }, secret, { expiresIn: '1h' });
		let refreshToken = jwt.sign({ tokenId: tokenIdentifier }, secret, { expiresIn: '1h' });

		res.cookie("refresh_token", JSON.stringify({
			token: refreshToken
		}), {
			httpOnly: true,
		});

		res.status(201).send({
			message: "Account created successfully!",
			token: accessToken,
			accountData: {
				userId: userId,
			}
		});
	} catch (ex) {
		res.status(400).json({ message: ex.message });
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

			res.status(201).send({
				message: "Token refreshed successfully!",
				token: newAccessToken,
				accountData: {
					user: userId,
				}
			});

		} catch (ex) {
			res.status(500).send(ex.message);
		}

	})();

}
