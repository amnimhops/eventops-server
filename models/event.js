var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var eventSchema = new Schema({
    _id: {
        type:Schema.Types.ObjectId,
        auto:true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref:'User'
    },
    location:{
        type: [Number],
        index: '2dsphere'
    },
    address: String,
    category:{
		type: Schema.Types.ObjectId,
        ref:'Category'
    },
    name: String,
    public: {
        type: Boolean,
        default: true
    },
    start: Schema.Types.Date,
    end: Schema.Types.Date,
    description: String
});

module.exports = mongoose.model('Event',eventSchema);