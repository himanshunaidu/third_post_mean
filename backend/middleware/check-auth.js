const jwt = require('jsonwebtoken');

// Export a function and not a constant, for a middleware
module.exports = (req, res, next) => {
  //const token = req.query.auth;
  // Token from the header will be set in the form "Bearer <token>"
  try{
    const token = req.headers.authorization.split(' ')[1];

    //Save the decoded token in the request, so that it passes on to the next request
    //Example, post method in post-routers.js
    const decodedtoken = jwt.verify(token, 'secret');
    req.userdata = {email: decodedtoken.email, userId: decodedtoken.userId};
    next();

  } catch(error){
    res.status(401).json({
      message: 'Not authenticated'
    });
  }

}
