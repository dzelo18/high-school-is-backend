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

exports.signIn = function (req, res) {

}

exports.authorizeRequest = function (req, res, next) {
    let header = req.headers['authorization'];
    if(!header) res.status(401).send('Unauthorized Request!');

    const token = header.split(' ')[1];
    if(!token) res.status(401).send("Unauthorized Request!");

    jwt.verify(token, secret, (err, data) => {
        if(err) res.status(401).send("Couldn't validate token!");
        let userID = data.userID;
        if(!userID) res.status(401).send("Invalid Token!");
        let sql = 'SELECT COUNT(*) AS accountCount FROM USER WHERE userID=?';    
        db.query(sql, [userID], (err, result) => {
            if(err) res.status(500).json({response: err.message});
            if(result[0].accountCount == 0) res.status(401).send("Invalid supplied account!");
        });
        next();
    });
}

exports.signup = async function (req, res) {
    let body = req.body;

    let accountCredentials = body.credentials;

        try{
            if (!signUpSchema.isValidSync(accountCredentials) ){
                throw new Error("Invalid data format supplied!");
            }
            let userId;
            let hashedPassword = await bcrypt.hash(accountCredentials.password, 10);

            let sql = `INSERT INTO User (role, username, password) VALUES ("student", ?, ?)`;

            await db.promise().query(sql, [accountCredentials.email, hashedPassword]).then( ([rows, fields]) => {
                userId = rows.insertId;
            }).catch( (err) => {
                throw new Error(err);
            });
    
            let tokenIdentifier = crypto.randomBytes(16).toString('hex');
            req.session.tokId = tokenIdentifier;

            let accessToken = jwt.sign({tokenId: tokenIdentifier, user: accountCredentials.email}, secret, {expiresIn: '1h'});
            let refreshToken = jwt.sign({tokenId: tokenIdentifier}, secret, {expiresIn: '1h'});
            
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
                    role: "student"
                }
            });
        } catch(ex){
            res.status(400).json({message: ex.message});
        }

}

exports.refreshToken = function (req, res) {
    //let body = req.body;

    (async() => {
        try{
            let tokenIdentifier = req.session.tokId;
            let refreshToken = JSON.parse(req.cookies.refresh_token);
            console.log(refreshToken);
            console.log(refreshToken.token);
            if(!refreshToken) throw new Error('Could not retrieve refresh token!');
            
            let email;

            jwt.verify(refreshToken.token, secret, (err, data) => {
                if(err) throw new Error(err.message);
                if(data.tokenId != tokenIdentifier) throw new Error('Could not authorize session!');
                email = data.user;
            });

            let newTokenIdentifier = crypto.randomBytes(16).toString('hex');
            req.session.tokId = newTokenIdentifier;

            let newAccessToken = jwt.sign({user: email}, secret, {expiresIn: '1h'})
            let newRefreshToken = jwt.sign({tokenId: newTokenIdentifier, user: email}, secret, {expiresIn: '1h'});

            res.cookie("refresh_token", JSON.stringify({
                token: newRefreshToken
            }), {
                httpOnly: true,
            });

            res.status(201).send({
                message: "Token refreshed successfully!",
                token: newAccessToken,
                accountData: {
                    email: email,
                    role: "student"
                }
            });

        }catch(ex){
            res.status(500).send(ex.message);
        }
        
    }) ();

}