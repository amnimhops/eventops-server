var router = require('osprey').Router();
var EventModel = require('./models/event.js');
var UserModel = require('./models/user.js').model;
var RequestModel = require('./models/request.js');
var SuggestionModel = require('./models/suggestion.js');
var CityModel = require('./models/city.js');
var CategoryModel = require('./models/category.js');

var Codes = {
	Unauthorized:{code:-1,msg:'Not authorized to do this'}

}

function sendOk(res,msg){
	res.status(200).send(msg||'Done');
}
function sendNotAuthorized(res,why){
	res.status(401).send('Not authorized.'+why);
}
function sendServerError(res,err){
	res.status(500).send('Server error.'+err);
}

/**
 * Creates a new user
 */
router.post('/users',(req,res) => {
	UserModel.create(req.body)
		.then((model)=>{
			res.json(model);
		})
		.catch((err)=>{
			sendServerError(res,err.errmsg);
		});
});

/**
 * Retrieves initial data
 * req.user -> contains the authenticated user
 */
router.get('/users/initialData',(req,res)=>{
	/**
	 * -Todos los eventos con owner:req.user._id
	 * -Todos los eventos request.event tal que request.user._id = req.user._id
	 * 
	 */
	var initialData = {
		user: req.user,
		events:null,
		requests:null
	};

	EventModel.find({
		owner:req.user._id
	}).then((events)=>{
		initialData.events = events;

		return RequestModel.find({user:req.user._id}).populate('event');
	}).then((requests)=>{
		initialData.requests = requests;
		res.json(initialData);
	}).catch((err)=>{
		sendServerError(res,err.errmsg);
	});
});

router.get('/users/{id}',function(req,res){
	var id = req.params.id;
	if(req.params.id=='me' && req.user){
		id = req.user._id;
	}
	UserModel.findOne({_id:id})
	.then((model)=>{
		res.json(model);
	})
	.catch((err)=>{
		sendServerError(res,err.errmsg);
	});
});

/**
 * Update user info
 */
router.put('/users/{id}',function(req,res){
	if(req.user._id.toString()===req.params.id){
		UserModel.update({_id:req.params.id},req.body)
		.then((model)=>{
			sendOk(res);
		})
		.catch((err)=>{
			sendServerError(res,err.errmsg);
		});
	}else{
		sendNotAuthorized(res,'User not logged');
	}
});
/**
 * delete user
 */
router.delete('/users/{id}',function(req,res){
	if(req.user._id.toString()===req.params.id){
		UserModel.remove({_id:req.params.id})
		.then((model)=>{
			req.user = null;
			sendOk(res);
		})
		.catch((err)=>{
			sendServerError(res,err.errmsg);
		});
	}else{
		sendNotAuthorized(res,'You cannot delete other users');
	}
});

router.get('/suggestions',function(req,res){
	SuggestionModel.find({to:req.user._id})
	.populate('from')
	.populate('event')
	.then((suggestions)=>{
		res.json(suggestions);
	});
});
router.post('/suggestions',function(req,res){
	var to = null;
	var theEvent = null;

	UserModel.findOne({email:req.body.email})
	.then((user)=>{
		if(!user){
			throw {errmsg:'user not found'};
		}else{
			to = user;
			return EventModel.findOne({_id:req.body.eventId});
		}
	})
	.then((event)=>{
		if(!event){
			throw {errmsg:'event not found'};
		}else{
			theEvent = event;
			return SuggestionModel
				.findOne({from:req.user._id,to:to._id,event:theEvent._id});
		}
	})
	.then((suggestion)=>{
		if(!suggestion){
			// There is no suggestion like this, so create a new one
			return SuggestionModel.create({
				from:req.user._id,
				to:to._id,
				event:theEvent._id
			});
			
		}else{
			console.log('Suggestion already exists!')
			return suggestion;
		}
	})
	.then((suggestion)=>{
		var popOpts = [
			{path:'from',model:'User'},
			{path:'to',model:'User'},
			{path:'event',model:'Event'}
		];

		return SuggestionModel.populate(suggestion,popOpts);
	})
	.then((populatedSuggestion)=>{
		res.json(populatedSuggestion);
	})
	.catch((err)=>{
		sendServerError(res,err.errmsg);
	});	
})
router.delete('/suggestions/{id}',function(req,res){
	SuggestionModel.remove({_id:req.params.id})
		.then((status)=>{ //n:0 -> 0 documents deleted
			sendOk(res);
		})
		.catch((err)=>{
			sendServerError(res,err.errmsg);
		});
});
//
// EVENTS
//
router.get('/events',function(req,res){
	var model = req.body;
	var criteria = null;

	if(req.query.search == 'own' && req.user){
		criteria = {owner : req.user._id};
	}else if(req.query.search == 'filter'){
		// Filtramos los privados
		criteria = {};
		criteria.public = true;

		if(req.query.lat && req.query.lng && req.query.distance){
			criteria.location ={
				$near:{
					$geometry:{
						type:"Point",
						coordinates:[req.query.lng,req.query.lat]
					},
					$maxDistance:req.query.distance
				}
			}
		}
		if(req.query.start){
			criteria.start = {$gte:req.query.start};
		}
		if(req.query.end){
			criteria.start = {$lte:req.query.end};
		}
		if(req.query.category){
			criteria.category = req.query.category;
		}
	}else{
		
	}

	if(criteria == null){
		sendServerError(res,"Bad query");
	}else{
		EventModel.find(criteria)
		.populate('owner')
		.populate('category')
		.then((events)=>{
			// Remove passwords
			for(var i in events) {if(events[i].owner && events[i].owner.password) delete events[i].owner.password}
			
			res.json(events);
		})
		.catch((err)=>{
			sendServerError(res,err.errmsg);
		})
	}
});

router.post('/events',function(req,res){
	var model = req.body;
	// Now inject the current user into the model data
	model.owner = req.user;

	EventModel.create(model)
	.then((event)=>{
		res.json(event);
	})
	.catch((err)=>{
		sendServerError(res,err.errmsg);
	})
})

/**
 * Get event info
 */
router.get('/events/{id}',function(req,res){
	EventModel.findOne({_id:req.params.id}).populate('owner').populate('category')
	.then((event)=>{
		if(event.public==false && (!req.user || !req.user._id.equals(event.owner._id))){
			sendNotAuthorized(res,'This event is private and is owned by other user');
		}else{
			res.json(event);
		}
	})
	.catch((err)=>{
		sendServerError(res,err.errmsg);
	});
});
/**
 * Update event
 */
router.put('/events/{id}',function(req,res){
	EventModel.findByIdAndUpdate(req.params.id,req.body,{new:true})//new:true returns the updated document in the promise
	.then((event)=>{
		res.json(event);
	})
	.catch((err)=>{
		sendServerError(res,err.errmsg);
	})
});

router.delete('/events/{id}',function(req,res){
	EventModel.findOne({_id:req.params.id})
	.then((event)=>{
		if(event == null){
			throw {errmsg:'event not found'};
		}else{
			if(req.user._id.equals(event.owner)){
				return EventModel.remove({_id:req.params.id});
			}else{
				throw {errmsg:'cannot delete this event'};
			}
		}
	})
	.then((success)=>{
		sendOk(res);
	})
	.catch((err)=>{
		sendServerError(res,err.errmsg);
	})
});



router.get('/requests',function(req,res){
	return RequestModel.find({
		$or:[
			{user:req.user._id},
			{sender:req.user._id}
		]
	})
	.populate('event')
	.populate('user')
	.populate('sender')
	.then((requests)=>{
		/* Remove passwords and our own info before sent! */
		for(var i in requests){
			if(requests[i].user && requests[i].user.password) delete requests[i].user.password;
			if(requests[i].sender && requests[i].sender.password) delete requests[i].sender.password;
		} 

		res.json(requests);
	})
	.catch((err)=>{
		sendServerError(res,err.errmsg);
	});
});

router.post('/requests',function(req,res){
	var eventId = req.body.eventId;
	var users = null;
	UserModel.find({
		email:{
			$in:req.body.emails
		}
	}).then((usersFound)=>{
		users = usersFound;
		return EventModel.findOne({_id:eventId})
	}).then((event)=>{
		if(!event) throw {errmsg:'Event does not exists'};
		if(!req.user._id.equals(event.owner)) throw {errmsg:'you dont own this event'}

		return RequestModel.find({event:eventId});
	})
	.then((requests)=>{
		
		var umap = {};
		for(var i in requests){
			umap[requests[i].user.toString()] = true;
		}

		for(var i in users){
			if(umap[users[i]._id.toString()]==undefined)// request not already sent!
				requests.push({
					event:eventId,
					user:users[i]._id,
					sender:req.user._id,
					accepted:false
				});
		}

		return RequestModel.create(requests);
	})
	.then((status)=>{
		sendOk(res);
	}).catch((err)=>{
		sendServerError(res,err.errmsg);
	});	
})

router.put('/requests/{id}',function(req,res){
	RequestModel.update({_id:req.params.id,user:req.user._id},{accepted:req.body.accepted})
	.then((success)=>{
		sendOk(res);
	})
	.catch((err)=>{
		sendServerError(res,err.errmsg);
	})
})
router.delete('/requests/{id}',function(req,res){
	RequestModel.remove({_id:req.params.id})
		.then((status)=>{ //n:0 -> 0 documents deleted
			sendOk(res);
		})
		.catch((err)=>{
			sendServerError(res,err);
		});
});
router.get('/cities',function(req,res){
	CityModel.find({name:{$regex:new RegExp("^"+req.query.q,"gi")}}).limit(5)
		.then((cities)=>{
			res.json(cities);
		})
		.catch((err)=>{
			sendServerError(res,err);
		});
});
router.get('/categories',function(req,res){
	CategoryModel.find()
		.then((categories)=>{
			res.json(categories);
		})
		.catch((err)=>{
			sendServerError(res,err);
		});
});
router.post('/share',function(req,res){
	sendServerError(res,'Because bluemix sendgrid emailing service is out of the coursera free tier, the emailing service is disabled');
});
module.exports = router;