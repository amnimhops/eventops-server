var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var requestSchema = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        auto: true
    },
    event: {
        type: Schema.Types.ObjectId,
        ref: 'Event'
    },
    sender:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    accepted: Boolean,
    date: {
        type: Schema.Types.Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Request',requestSchema);