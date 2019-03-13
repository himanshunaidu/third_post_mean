const mongoose = require('mongoose');

const postschema = mongoose.Schema({
  title: {type: String, required: true},
  content: {type: String, required: true},
  imageUrl: {type: String, required: true},
  // The following datatype is an object id provided by mongoose
  creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}
});

module.exports = mongoose.model('Post', postschema);
