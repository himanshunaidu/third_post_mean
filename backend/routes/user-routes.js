const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const bcrypt = require('bcryptjs');

router.post("/signup", (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new User({
        email: req.body.email,
        //Must not store password unencrypted
        //Install bcrypt for encryption
        password: hash
      });

      user.save()
        .then(result => {
          return res.status(201).json({
            message: 'User created!',
            result: result
          })
        })
        .catch(err => {
          res.status(500).json({
              message: 'Invalid signup credentials'
          })
        })
    });
});

router.get("/login", (req, res, next) => {
  let fetcheduser;
  //For validation
  User.findOne({email: req.query.email})
    .then(user => {
      if(!user){
        return res.status(401).json({
          message: 'Invalid login attempt'
        })
      }

      fetcheduser = user;
      return bcrypt.compare(req.query.password, user.password);
    })
    .then(result => {
      if(!result){
        return res.status(401).json({
          message: 'Invalid login attempt'
        })
      }

      //Create JSON Web Token
      const token = jwt.sign({email: fetcheduser.email, userId: fetcheduser._id}, 'secret',
        {expiresIn: '1h'});
      return res.status(201).json({
        token: token,
        expiresIn: 3600,
        userId: fetcheduser._id
      })
    })
    .catch(err => {
      res.status(404).json({
        message: 'Invalid login credentials'
      })
    })

})

module.exports = router;
