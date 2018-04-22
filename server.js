var express = require('express'),
    app = express(),
    port = process.env.PORT || 8888,
    mongoose = require('mongoose'),
    RiotApiData = require('./api/models/baseschema');


mongoose.Promise = global.Promise;
mongoose.connect('mongodb://riotapidatauser:VY72vHSenWUUQVIV@cluster0-shard-00-00-vm1vb.mongodb.net:27017,cluster0-shard-00-01-vm1vb.mongodb.net:27017,cluster0-shard-00-02-vm1vb.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin');
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


var routes = require('./api/routes/routes'); //importing route
routes(app); //register the route

app.listen(port);

console.log('RiotDataRetriever server started on: ' + port);

var riotdataretriever = require('./api/controllers/controller');
riotdataretriever.updateMatches();
