const dataAction = require('../modules/dataaction');
const client = require('../modules/client');

let fileName = 'public.entity';
let logName = 'public.l_entity';

exports.create = async(req, res) => {
    try {

        let objEntity = req.body;
        objEntity.password = await dataAction.hashStr(objEntity.password);

        let qStr = await dataAction.dataGet(fileName, objEntity);
        let newEntity = await client.query(qStr);
        res.json({ code: 'OK', message: 'Saved Successfully', recordid: newEntity.rows[0].recordid });
    } catch (err) {
        console.log('create error', err.message);
        res.status(500).send();
    }
}

exports.findAll = async(req, res) => {
    try {
        let result = await client.query(`SELECT * FROM ${fileName} ORDER BY recordid`);
        res.send(result.rows);
    } catch (err) {
        console.log('findAll error', err.message);
    }
}

exports.findOne = async(req, res) => {
    try {
        let result = await client.query(`SELECT * FROM ${fileName} WHERE recordid = ${req.params.entityid}`);
        res.send(result.rows[0]);
    } catch (err) {
        console.log('findOne error', err.message);
    }
}

exports.findOneByEmail = async(email) => {
    try {
        let result = await client.query(`SELECT * FROM ${fileName} WHERE email = '${email}'`);
        return await result.rows[0];
    } catch (err) {
        console.log('findOneByEmail error', err.message);
        return err.message;
    }
}

exports.update = async(req, res) => {
    try {
        if (dataLog()) {
            let qStr = await dataAction.dataUpd(fileName, req.body, req.params.entityid);
            let updEntity = await client.query(qStr);
            res.json(`${updEntity.rowCount} row/s affected`);
        }

    } catch (err) {
        console.log('update error', err.message);
    }
}

exports.delete = (req, res) => {
    res.send({ list: customers });
}

exports.findCurrent = (req, res) => {
    try {
        console.log('req.user', req.user);
        res.send({ code: 'OK', message: 'Success', user: req.user });
    } catch (error) {
        console.log('findCurrent error', err.message);
        res.send({ code: 'ERROR', message: err.message, user: null });
    }
}

const dataLog = async() => {
    return true;
}