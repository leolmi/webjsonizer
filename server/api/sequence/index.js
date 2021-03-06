/**
 * Created by Leo on 20/05/2015.
 */
'use strict';

var express = require('express');
var controller = require('./sequence.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/publish/:id', auth.isAuthenticated(), controller.publish);
router.get('/releases/:id', auth.isAuthenticated(), controller.releases);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', auth.isAuthenticated(), controller.create);
router.post('/star', auth.isAuthenticated(), controller.toggle);
router.post('/test', auth.isAuthenticated(), controller.parse);
router.post('/play', auth.isAuthenticated(), controller.play);
router.post('/search', controller.search);

router.put('/:id', auth.isAuthenticated(), controller.update);
router.patch('/:id', auth.isAuthenticated(), controller.update);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);

module.exports = router;
