var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RiotApiDataSchema = new Schema({
    gameId: Number,
    gameCreation: Date,
    gameDuration: Number
}, { strict: false });

module.exports = mongoose.model('RiotApiData', RiotApiDataSchema);

