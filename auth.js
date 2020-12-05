require('dotenv').config();
const client = require('./modules/client');

const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const cors = require('cors');

const dataAction = require('./modules/dataaction');
const entity = require('./controllers/entity.controller');

app.use(cors());
app.use(express.json());

app.post('/login', async(req, res) => {
    //Authenticate User
    const user = await entity.findOneByEmail(req.body.email)

    if (user == null) return res.status(400).send({
        code: 'ERROR',
        message: 'Unauthorized access'
    });

    try {
        if (await dataAction.compareHash(req.body.password, user.password)) {
            //Correct Password 
            const jwtUser = {
                userid: user.recordid,
                firstname: user.firstname,
                lastname: user.lastname,
                company: user.company
            };

            const accessToken = generateAccessToken(jwtUser);
            const refreshToken = jwt.sign(jwtUser, process.env.REFRESH_TOKEN_SECRET);

            //Save Refresh Token
            let isSaved = await saveRefreshToken(jwtUser.userid, refreshToken);
            console.log('isSaved', isSaved);

            res.json({
                code: 'OK',
                message: 'Logged in successfully',
                accessToken: accessToken,
                refreshToken: refreshToken
            });
        } else
            res.json({
                code: 'ERROR',
                message: 'Unauthorized Access'
            });
    } catch (error) {
        res.status(500).send({
            code: 'ERROR',
            message: error.message
        });
    }
});

app.listen(4444, err => {
    if (err) return console.log("ERROR", err);
    console.log(`Listening on port ${4444}`);
});

const generateAccessToken = (user) => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '20m' }); //15s
}

app.post('/token', async(req, res) => {
    const refreshToken = req.body.token;
    if (refreshToken == null) return res.sendStatus(401);

    //Check with active refresh tokens
    let isAvailable = await checkRefreshToken(refreshToken);
    if (!isAvailable) return res.status(403).send({ code: 'ERROR', message: 'Invalid Refresh Token' });

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);

        const accessToken = generateAccessToken({ name: user.name });
        res.json({ accessToken: accessToken });
    });
});

app.delete('/logout', async(req, res) => {

    try {
        let result = await client.query(`UPDATE authuser SET isactive=false WHERE refreshtoken='${req.body.token}'`);
        console.log('result', result);
        res.json({ code: 'OK', message: 'Success', logout: true });
    } catch (err) {
        console.log('logout error', err.message);
        res.json({ code: 'ERROR', message: 'Fail', logout: true });
    }


});

const checkRefreshToken = async(refreshToken) => {
    try {
        let result = await client.query(`SELECT recordid,entity FROM authuser WHERE refreshtoken='${refreshToken}' AND isactive=true`);
        console.log('result.rows.rowCount', result.rows.length);
        return result.rows.length;

    } catch (err) {
        console.log('findAll error', err.message);
    }
    return null;
}

const saveRefreshToken = async(userId, refreshToken) => {
    try {
        let result = await client.query(`INSERT INTO authuser(entity, refreshtoken, isactive) VALUES (${userId}, '${refreshToken}', true)`);
        console.log('result.rows', result.rows);
        res.send(result.rows);
    } catch (err) {
        console.log('findAll error', err.message);
    }
}