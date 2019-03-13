const express = require('express');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
//Following package is to construct paths
const path = require('path');

//Used to avoid deprecation warning of mongoose ensureIndex
mongoose.set('useCreateIndex', true);

const Post = require('./models/post');

const PostRouters = require('./routes/post-routers');
const UserRoutes = require('./routes/user-routes');

const app = express();

mongoose.connect('<DATABASE_NAME>', {useNewUrlParser: true})
  .then(()=>{
    console.log('Connected to the MongoDB database');
  })
  .catch(()=>{
    console.log('Error connecting to database');
  });

app.use(bodyparser.json());
//app.use(bodyparser.urlencoded({extended: false}));

//Grant permission to images folder: Relative to server.js
app.use('/images', express.static(path.join('backend/images')));

app.use((req, res, next)=>{
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.setHeader("Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  next();
});


app.use('/api/posts', PostRouters);
app.use('/api/user', UserRoutes);


module.exports = app;
