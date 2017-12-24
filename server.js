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
	return mongoose.connect(url, { useMongoClient: true })
}


setupConnection()
	.then((db) => {
		console.log('MongoDB connected');
		/*
		 * Basic security settings
		 */
		return osprey.loadFile(path,{
			security:{
				basic:{
					validateUser:validateUser
				},
				// custom -> x-session defined in api.raml
				session:function(scheme,name){
					return {
						handler:function(options,path){
							return function(req,res,next){
								return next();
							}
						}
					}
				}
			}
		});
	})
	.then((middleware) => {
		console.log('Osprey active');
		var app = express();
		// CORS
		app.use(function(req, res, next) {
			res.header("Access-Control-Allow-Origin", "*");
			res.header("Access-Control-Allow-Headers", "Authorization, Origin, X-Requested-With, Content-Type, Accept");
			res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
			
			next();
		});
		
		app.use('/v1', middleware, router);
		app.use('/',express.static('www'));
		app.listen(process.env.PORT||3000, function () {
			console.log('Express active');
		});
	})
	.catch((err)=>{
		console.log(err);
	});
