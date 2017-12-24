var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var categorySchema = new Schema({
    _id: {
        type:Schema.Types.ObjectId,
        auto:true
    },
    name: String,
    image: String
});

module.exports = mongoose.model('Category',categorySchema);