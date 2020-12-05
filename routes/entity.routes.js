"use strict";
const express = require("express");
let router = express.Router();

const dataAction = require('../modules/dataaction');
const entity = require('../controllers/entity.controller');

router.use((req, res, next) => {
    console.log(req.url, '@', Date.now());
    next();
});

router
    .route('/')
    .get(dataAction.authenticateToken, entity.findAll)
    .post(entity.create); //Register

router
    .route('/user')
    .get(dataAction.authenticateToken, entity.findCurrent)

router
    .route('/:entityid')
    .get(dataAction.authenticateToken, entity.findOne)
    .put(dataAction.authenticateToken, entity.update)
    .delete(dataAction.authenticateToken, entity.delete);

router
    .route('/email/:emailid')
    .get(entity.findOneByEmail) //For login




module.exports = router;