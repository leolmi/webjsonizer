/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

const User = require('../api/user/user.model');

User.deleteMany({}, () => {
  User.create({
    _id: '54b3e04cde6279a8211b42fe',
    provider: 'local',
    name: 'Test User',
    email: 'test@test.com',
    password: 'test'
  }, {
    _id: '54b3e04cde6279a8211b42fd',
    provider: 'local',
    role: 'admin',
    name: 'Admin',
    email: 'admin@admin.com',
    password: 'admin'
  }, () => console.log('finished populating users'));
});

// var Sequence = require('../api/sequence/sequence.model');
// Sequence.find({}).remove(function() {
//   Sequence.create({
//     title: 'Repubblica',
//     SSL: false,
//     owner: '54b3e04cde6279a8211b42fe',
//     star: false,
//     enabled: true,
//     parameters: [],
//     items: [{
//       title: 'Access',
//       host: 'www.repubblica.it',
//       method: 'GET',
//       path: '/sport/calcio/serie-a/fiorentina/',
//       prejs: [],
//       postjs: [],
//       headers: [
//         {name: 'Accept-Encoding', value: 'gzip, deflate, sdch'},
//         {name: 'Host', value: 'www.repubblica.it'},
//         {name: 'Accept-Language', value: 'it,it-IT;q=0.8,en;q=0.6,en-US;q=0.4'},
//         {
//           name: 'User-Agent',
//           value: 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.81 Safari/537.36'
//         },
//         {name: 'Accept', value: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'},
//         {name: 'Cache-Control', value: 'max-age=0'},
//         {name: 'Proxy-Connection', value: 'keep-alive'}]
//     }],
//     parserOptions: {
//       type: 'htmltable',
//       pattern: '$(\'#tab-risultati1\').find(\'table\')'
//     }
//   }, {
//     title: 'HQ',
//     SSL: false,
//     owner: '54b3e04cde6279a8211b42fe',
//     star: true,
//     enabled: true,
//     parameters: [],
//     items: [{
//       title: 'Enter',
//       host: 'earthquake.usgs.gov',
//       method: 'get',
//       path: '/monitoring/deformation/data/download/table.php',
//       prejs: [],
//       postjs: [],
//       headers: [{
//         "name": "Accept",
//         "value": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
//       }, {
//         "name": "Accept-Encoding",
//         "value": "gzip, deflate, sdch"
//       }, {
//         "name": "Proxy-Connection",
//         "value": "keep-alive"
//       }, {
//         "name": "Host",
//         "value": "earthquake.usgs.gov"
//       }, {
//         "name": "Accept-Language",
//         "value": "it,it-IT;q=0.8,en;q=0.6,en-US;q=0.4"
//       }, {
//         "name": "User-Agent",
//         "value": "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.130 Safari/537.36"
//       }],
//       "data": []
//     }],
//     parserOptions: {
//       type: 'htmltable',
//       pattern: '$(\'.tabular\').eq(0)'
//     }
//   }, {
//     title: 'HQ2',
//     SSL: false,
//     owner: '54b3e04cde6279a8211b42fe',
//     star: true,
//     enabled: true,
//     parameters: [],
//     items: [{
//       title: 'step 1',
//       host: 'earthquake.usgs.gov',
//       method: 'get',
//       path: '/monitoring/operations/network.php?network=GSN',
//       prejs: [],
//       postjs: [],
//       headers: [{
//         "name": "Accept",
//         "value": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
//       }, {
//         "name": "User-Agent",
//         "value": "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.130 Safari/537.36"
//       }],
//       "data": []
//     }],
//     parserOptions: {
//       type: 'htmltable',
//       pattern: '$(\'.network-table\')'
//     }
//   }, function() {
//     console.log('finished populating sequences');
//   });
// });

const Release = require('../api/deploy/release.model');
Release.deleteMany({}, () => console.log('finished deleting releases'));
