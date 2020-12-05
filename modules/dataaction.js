require('dotenv').config();
const express = require("express");
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

app.use(express.json())

exports.dataGet = async(fileName, dataObj) => {

    let keys = '';
    let values = '';

    Object.keys(dataObj).map((x) => {
        keys += `,${x}`;
        values += typeof(dataObj[x]) == 'string' ? `,'${dataObj[x]}'` : `,${dataObj[x]}`;
    })

    keys = keys.replace(',', '');
    values = values.replace(',', '');

    return `INSERT INTO ${fileName} (${keys}) VALUES (${values}) RETURNING *`; // 
}


exports.dataUpd = async(fileName, dataObj, recId) => {

    let key = '';
    let value = '';
    let str = '';

    Object.keys(dataObj).map((x) => {
        key = `${x}`;
        value = typeof(dataObj[x]) == 'string' ? `'${dataObj[x]}'` : `${dataObj[x]}`;
        str += `, ${key}=${value}`;
    });

    str = str.replace(', ', '');

    return `UPDATE ${fileName} SET ${str} WHERE recordid = ${recId}`;
}

exports.hashStr = async(str) => {
    //  salt = salt || await bcrypt.genSalt();
    return await bcrypt.hash(str, 10);
}

exports.compareHash = async(str, compStr) => {
    console.log('str', str);
    console.log('compStr', compStr);
    try {
        if (await bcrypt.compare(str, compStr))
            return true;
        else
            return false;
    } catch (error) {
        console.log('error', error);
    }
}

exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    console.log('authHeader', authHeader)
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.status(401).send({ code: 'ERROR', message: 'Unauthorized user, invalid token' });

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403).send({ code: 'ERROR', message: 'Token not verified' });
        req.user = user;
        next();
    });
}