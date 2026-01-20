var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var citySchema = new Schema({
    _id: {
        type:Schema.Types.ObjectId,
        auto:true
    },
    name: String,
    country: String,
    location:{
        type: [Number],
        index: '2dsphere'
    },
    description: String
});

module.exports = mongoose.model('City',citySchema);