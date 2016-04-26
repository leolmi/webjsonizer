/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var User = require('../api/user/user.model');
var Sequence = require('../api/sequence/sequence.model');

User.find({}).remove(function() {
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
  }, function() {
    console.log('finished populating users');
  }
  );
});


Sequence.find({}).remove(function() {
  Sequence.create({
      title: 'Repubblica',
      SSL: false,
      owner: '54b3e04cde6279a8211b42fe',
      star: false,
      enabled: true,
      parameters: [],
      items: [{
        title: 'Access',
        host: 'www.repubblica.it',
        method: 'GET',
        path: '/sport/calcio/serie-a/fiorentina/',
        prejs: [],
        postjs: [],
        headers: [
          { name:'Accept-Encoding', value:'gzip, deflate, sdch' },
          { name:'Host', value:'www.repubblica.it' },
          { name:'Accept-Language', value:'it,it-IT;q=0.8,en;q=0.6,en-US;q=0.4' },
          { name:'User-Agent', value:'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.81 Safari/537.36' },
          { name:'Accept', value:'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8' },
          { name:'Cache-Control', value:'max-age=0' },
          { name:'Proxy-Connection', value:'keep-alive' }]
      }],
      selector:'$(\'#tab-risultati1\').find(\'table\')'
    },{
    title: 'Prova Salvata 01',
    SSL: false,
    owner: '54b3e04cde6279a8211b42fe',
    star: false,
    enabled: true,
    parameters: [],
    items: [{
      title: 'Access',
      host: 'www.ciccio.com',
      method: 'get',
      path: '/bello/fuffo.html',
      prejs: [],
      postjs: [],
      headers: [{
        name:"Content-Type", value:"testo puppappera"}]
    }, {
      title: 'Page',
      method: 'post',
      path: '/bello/lallo.html',
      referer: 'auto',
      data: [
        {name:"valore1",value:"123"},
        {name:"valore2",value:"456"}],
      prejs: [],
      postjs: [],
      headers: []
    }]
  },{
    title: 'Prova Salvata 02',
    SSL: true,
    owner: '54b3e04cde6279a8211b42fe',
    star: false,
    enabled: false,
    parameters: [{
      name:'puno',
      value:'135135'
    },{
      name:'pdue',
      value:'cacca di vacca'
    }],
    items: [{
      title: 'Enter',
      host: 'www.bubbodibebbo.com',
      method: 'get',
      path: '/fafa/sgnacco.html',
      prejs: [],
      postjs: [],
      headers: []
    }]
  },{
      title: 'HQ',
      SSL: false,
      owner: '54b3e04cde6279a8211b42fe',
      star: true,
      enabled: true,
      parameters: [],
      items: [{
        title: 'Enter',
        host: 'earthquake.usgs.gov',
        method: 'get',
        path: '/monitoring/deformation/data/download/table.php',
        prejs: [],
        postjs: [],
        headers: [{
          "name":"Accept",
          "value":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
        },{
          "name":"Accept-Encoding",
          "value":"gzip, deflate, sdch"
        },{
          "name":"Proxy-Connection",
          "value":"keep-alive"
        },{
          "name":"Host",
          "value":"earthquake.usgs.gov"
        },{
          "name":"Accept-Language",
          "value":"it,it-IT;q=0.8,en;q=0.6,en-US;q=0.4"
        },{
          "name":"User-Agent",
          "value":"Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.130 Safari/537.36"
        }],
        "data":[]
      }],
      selector:'$(\'.tabular\').eq(0)'
    }, function() {
      console.log('finished populating sequences');
    }
  );
});
