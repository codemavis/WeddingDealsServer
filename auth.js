require('dotenv').config();

const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');

const dataAction = require('./modules/dataaction');
const entity = require('./controllers/entity.controller');

app.use(express.json());

let refreshTokens = [];

app.post('/login', async(req, res) => {
    //Authenticate User
    const user = await entity.findOneByEmail(req.body.email)

    if (user == null) return res.status(400).send('Cannot find user');

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

            res.json({ accessToken: accessToken, refreshToken: refreshToken });
        } else
            res.send('Not allowed');
    } catch (error) {
        res.status(500).send();
    }
});

app.listen(4444, err => {
    if (err) return console.log("ERROR", err);
    console.log(`Listening on port ${4444}`);
});

const generateAccessToken = (user) => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '20m' }); //15s
}

app.post('/token', (req, res) => {
    const refreshToken = req.body.token;
    if (refreshToken == null) return res.sendStatus(401);

    //Not
    //if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);

        const accessToken = generateAccessToken({ name: user.name });
        res.json({ accessToken: accessToken });
    });

});

app.delete('/logout', (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token);
    res.json({ logout: true });
});