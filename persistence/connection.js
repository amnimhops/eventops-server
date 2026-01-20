/**
 * Para evitar el uso de una base de datos real durante las pruebas,
 * utilizamos Mockgoose para simular MongoDB en memoria.
 */
const mongoose = require("mongoose");
const MockGoose = require("mockgoose").Mockgoose;
const mockgoose = new MockGoose(mongoose);
const importCities = require('../utils/importcities');
const mocks = require('../utils/mockdata');

function setupConnection() {
    var url = null;

    try{
        var services = JSON.parse(process.env.VCAP_SERVICES);
        url = services['compose-for-mongodb'][0].credentials.uri;
    }catch(e){
        url = 'mongodb://localhost/eventops';
    }

    console.log('Connecting mondgodb');
    mongoose.Promise = global.Promise;
    
    return mockgoose
        .prepareStorage()
        .then(() => mongoose.connect(url, { useMongoClient: true }))
        .then(importCities)
        .then(mocks.createCategories)
        .then(() => mocks.createEvents(20));
}

module.exports = setupConnection;