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

        let sql = 'SELECT COUNT(*) AS accountCount FROM USER WHERE userID=?';    
        ( async()=> {
            await db.query(sql, [userID], (err, result) => {
                if(err) res.status(500).json({response: err.message});
                if(result[0].accountCount == 0) res.status(401).send("Invalid supplied account!");
            });
        }) ();
        next();
    });
}

exports.signup = function (req, res) {
    let body = req.body;

    let accountCredentials = body.credentials;

    ( async ()=> {
        try{
            await signUpSchema.isValid(accountCredentials).then( isValid => {
                if(!isValid) throw new Error("Invalid data format supplied!");
            });

            let hashedPassword = bcrypt.hash(accountCredentials.password, 10);
            let sql = 'INSERT INTO User VALUES ("student", ?, ?)';
            
            ( async()=> {
                await db.query(sql, [accountCredentials.email, hashedPassword], (err, result) => {
                    if(err) res.status(500).json({response: err.message});
                    console.log(result);
                });
            }) ();
    
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
                    email: accountCredentials.email,
                    role: "student"
                }
            });
        } catch(ex){
            res.status(400).send(ex.message);
        }
    }) ();

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