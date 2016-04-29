/**
 * Created by Leo on 20/05/2015.
 */
'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var SequenceJSSchema = new Schema({
  id: String,         // identificativo
  target: String,     // parametro target     era://target del valore calcolato
  sourceType: String, // tipo di risorsa
  name: String,       // nome property        era://nome della logica di validazione (può individuare la funzione)
  content: String,    // [OBSOLETA]           era://corpo del metodo js che accetta come parametri 'content' e 'params' per restituire il valore di un parametro
  logic: String,      // logica
  logicType: String,  // tipo logica (none, javascript, regex)
  mode: String,       // [OBSOLETA]           era://modalità
  ttype: String       // [OBSOLETA]           era://tipologia del target: 'parameter' o 'data'
});

var NameValueSchema = new Schema({
  id: String,
  name: String,
  value: String,
  hidden: Boolean
});

var SequenceItemSchema = new Schema({
  title: String,
  skip: Boolean,
  host: String,
  method: String,
  path: String,
  referer: String,  //se='auto' viene preso il precedente path
  data: [NameValueSchema],
  datatype: String,
  prejs: [SequenceJSSchema],
  postjs: [SequenceJSSchema],
  headers: [NameValueSchema],
  keepers: [SequenceJSSchema]
});

var SequenceSchema = new Schema({
  title: String,
  SSL: Boolean,
  owner: String,
  star: Boolean,
  enabled: Boolean,
  result: Schema.Types.Mixed,
  parameters: [NameValueSchema],
  items: [SequenceItemSchema],
  parserOptions: Schema.Types.Mixed
});

module.exports = mongoose.model('Sequence', SequenceSchema);
