/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var Thing = require('../api/thing/thing.model');
var User = require('../api/user/user.model');
var Sequence = require('../api/sequence/sequence.model');

Thing.find({}).remove(function() {
  Thing.create({
    name : 'Development Tools',
    info : 'Integration with popular tools such as Bower, Grunt, Karma, Mocha, JSHint, Node Inspector, Livereload, Protractor, Jade, Stylus, Sass, CoffeeScript, and Less.'
  }, {
    name : 'Server and Client integration',
    info : 'Built with a powerful and fun stack: MongoDB, Express, AngularJS, and Node.'
  }, {
    name : 'Smart Build System',
    info : 'Build system ignores `spec` files, allowing you to keep tests alongside code. Automatic injection of scripts and styles into your index.html'
  },  {
    name : 'Modular Structure',
    info : 'Best practice client and server structures allow for more code reusability and maximum scalability'
  },  {
    name : 'Optimized Build',
    info : 'Build process packs up your templates as a single JavaScript payload, minifies your scripts/css/images, and rewrites asset names for caching.'
  },{
    name : 'Deployment Ready',
    info : 'Easily deploy your app to Heroku or Openshift with the heroku and openshift subgenerators'
  });
});

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
      prevalidations: [],
      postvalidations: [],
      headers: []
    }, {
      title: 'Page',
      method: 'post',
      path: '/bello/lallo.html',
      referer: 'auto',
      data: '',
      prevalidations: [],
      postvalidations: [],
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
      prevalidations: [],
      postvalidations: [],
      headers: []
    }]
  }, function() {
      console.log('finished populating sequences');
    }
  );
});
