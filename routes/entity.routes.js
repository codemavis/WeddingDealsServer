"use strict";
const express = require("express");
let router = express.Router();

const dataAction = require('../modules/dataaction');
const customers = require('../controllers/entity.controller');

router.use((req, res, next) => {
    console.log(req.url, '@', Date.now());
    next();
});

router
    .route('/')
    .get(dataAction.authenticateToken, customers.findAll)
    .post(customers.create); //Register

router
    .route('/:entityid')
    .get(dataAction.authenticateToken, customers.findOne)
    .put(dataAction.authenticateToken, customers.update)
    .delete(dataAction.authenticateToken, customers.delete);

router
    .route('/email/:emailid')
    .get(customers.findOneByEmail) //For login


module.exports = router;