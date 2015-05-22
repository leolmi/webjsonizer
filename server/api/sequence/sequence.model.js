/**
 * Created by Leo on 20/05/2015.
 */
'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var SequenceValidationSchema = new Schema({
  name: String,  //nome della logica di validazione (può individuare la funzione)
  //func: Function  //non è persistita, ma passata dall'utilizzatore a run-time
  js: String, //corpo del metodo js che accetta come parametri 'content' e 'params' per restituire il valore di un parametro
  target: String  //parametro target del valore calcolato
});

var NameValueSchema = new Schema({
  name: String,
  value: String,
  hidden: Boolean
});

var SequenceItemSchema = new Schema({
  title: String,
  host: String,
  method: String,
  path: String,
  referer: String,  //se='auto' viene preso il precedente path
  data: String,
  prevalidations: [SequenceValidationSchema],
  postvalidations: [SequenceValidationSchema],
  headers: [NameValueSchema]
});

var SequenceSchema = new Schema({
  title: String,
  name: String,
  SSL: Boolean,
  owner: String,
  star: Boolean,
  enabled: Boolean,
  parameters: [NameValueSchema],
  items: [SequenceItemSchema]
});

module.exports = mongoose.model('Sequence', SequenceSchema);
