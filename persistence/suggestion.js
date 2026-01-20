var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var suggestionSchema = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        auto: true
    },
    event: {
        type: Schema.Types.ObjectId,
        ref: 'Event'
    },
    from:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    to: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    when: {
        type:Schema.Types.Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Suggestion',suggestionSchema);