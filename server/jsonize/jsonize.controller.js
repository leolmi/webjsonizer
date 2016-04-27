'use strict';

var Sequence = require('../api/sequence/sequence.controller');

// Restituisce lo schema per la chiamata alla sequenza
exports.schema = function(req, res) {
  Sequence.schema(req, res);
};

// Esegue la sequenza restituendo i risultati
exports.jsonize = function(req, res) {
  Sequence.milk(req, res);
};
