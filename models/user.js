const {model, Schema, Types} = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const thisSchema =  new Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true, minlength: 6},
    image: {type: String, required: true},
    places: [{type: Types.ObjectId, required: true, ref: 'Place'}]
});

thisSchema.plugin(uniqueValidator);

module.exports = model('User', thisSchema);