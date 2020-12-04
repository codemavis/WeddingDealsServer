"use strict";
const express = require("express");
const app = express();
const port = process.env.port || 5000;

const cors = require('cors');
app.use(cors());

const entity = require('./routes/entity.routes');

app.use(express.json());

app.use('/entity', entity);

app.get('/', (req, res) => {
    //handle root
    res.send("hi root");
});

app.listen(port, err => {
    if (err) return console.log("ERROR", err);
    console.log(`Listening on port ${port}`);
});