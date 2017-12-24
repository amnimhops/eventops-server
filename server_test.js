/*
 * https://github.com/mulesoft/osprey
 * https://github.com/mulesoft/osprey/blob/master/examples/express/index.js
 */
var mongoose = require('mongoose');
var osprey = require('osprey');
var express = require('express');
var join = require('path').join;
var path = join(__dirname, 'api.raml');
var router = require('./router.js');
var validateUser = require('./models/user.js').validation;

var url = null;

try{
    console.log(process.env);
    var services = JSON.parse(process.env.VCAP_SERVICES);
    url = services['compose-for-mongodb'][0].credentials.uri;
}catch(e){
    url = 'mongodb://localhost/eventops';
    console.log(e,url);
}

console.log(url);

