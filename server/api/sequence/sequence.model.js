/**
 * Created by Leo on 20/05/2015.
 */
'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var SequenceJSSchema = new Schema({
  name: String,    // nome della logica di validazione (può individuare la funzione)
  //func: Function // non è persistita, ma passata dall'utilizzatore a run-time
  content: String, // corpo del metodo js che accetta come parametri 'content' e 'params' per restituire il valore di un parametro
  mode: String,    // modalità
  target: String,  // target del valore calcolato
  ttype: String    // tipologia del target: 'parameter' o 'data'
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
  data: [NameValueSchema],
  datatype: String,
  prejs: [SequenceJSSchema],
  postjs: [SequenceJSSchema],
  headers: [NameValueSchema]
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
  keepers: [SequenceJSSchema],
  selector: String
});

module.exports = mongoose.model('Sequence', SequenceSchema);
