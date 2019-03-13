const mongoose = require('mongoose');
const uniquevalidator = require('mongoose-unique-validator');

const userschema = mongoose.Schema({
  email: {type: String, required: true, unique: true},
  //unique keyword would not ensure that the values are unique,
  //rather it makes mongoose just assume they are
  password: {type: String, required: true}
});

userschema.plugin(uniquevalidator);

module.exports = mongoose.model('User', userschema);
