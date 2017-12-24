var mongoose = require('mongoose');
console.log('Connecting mondgodb');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/eventops', { useMongoClient: true }).then((db)=>{
    var router = require('osprey').Router();
    var EventModel = require('./models/event.js');
    var UserModel = require('./models/user.js').model;
    var RequestModel = require('./models/request.js');
    var SuggestionModel = require('./models/suggestion.js');


    var numUsers = 10000;
    var numEvents = 10000;

    for(var i=0;i<numUsers;i++){
        // elegir random loc
        var loc = [-180 + (Math.random() * 180 * 2),-90 + (Math.random() * 90  * 2)];
        
    }

});