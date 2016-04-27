/* Created by Leo on 27/04/2016. */
'use strict';

var express = require('express');
var controller = require('./jsonize.controller');

var router = express.Router();

router.post('/', controller.jsonize);

module.exports = router;
