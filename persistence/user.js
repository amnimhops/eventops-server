var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var suggestionSchema = new Schema({
    event:{
        type:Schema.Types.ObjectId,
        ref:'Event'
    },
    from:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    when: Schema.Types.Date
});
var userSchema = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        auto: true
    },
    email: {
        type: String,
        unique: true,
    },
    password: String,
    name: String,
    city: String,
    location: {
        type: [Number],
        index: '2dsphere'
    }
});

module.exports.model = mongoose.model('User', userSchema);
module.exports.validation = function (user, password, callback) {
    mongoose.model('User', userSchema).findOne({
        email: user,
        password: password
    }).then((model) => {
        callback(null,model);
    }).catch((err) => {
        console.error(err);
        callback(err,null);
    });
}