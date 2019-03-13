const express = require('express');
const router = express.Router();
const multer = require('multer');

const Post = require('../models/post');

// For authorization
const checkauth = require('../middleware/check-auth');

//This router is called only when we are using the localhost:3000/api/posts

//For multer
const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    //In the follwing path, backend needs to be specificed because the path is checked relative to
    //server.js and not post.routers.js
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if(isValid){
      error = null;
    }
    cb(error, "backend/images");
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('_');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name+'-'+Date.now()+'.'+ext);
  }
});

router.post('', checkauth,
  multer({storage: storage}).single("image"), (req, res, next)=>{
  //console.log(req.protocol+'://'+req.get('host'));
  const url = req.protocol+'://'+req.get('host');
  //const post = req.body;
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imageUrl: url + '/images/' + req.file.filename,
    // Extract the decoded token that is passed on by checkauth (which is passed to post as parameter)
    creator: req.userdata.userId
  });
  //console.log(post);
  post.save()
  .then(createdpost => {
    //console.log(result);
    return res.status(201).json({
      message: 'Post added successfully',
      post: {
        _id: createdpost._id,
        title: createdpost.title,
        content: createdpost.content,
        imageUrl: createdpost.imageUrl
      }
    });
  })
  .catch((error) => {
    res.status(500).json({
      message: 'Post Creation Failed'
    })
  });
});

router.put('/:_id', checkauth, multer({storage: storage}).single("image"), (req, res, next)=>{
  let imagepath = req.body.imageUrl;
  if(req.file){
    const url = req.protocol+'://'+req.get('host');
    imagepath = url + '/images/' + req.file.filename;
  }
  const post = new Post({
    _id: req.body._id,
    title: req.body.title,
    content: req.body.content,
    imageUrl: imagepath,
    creator: req.userdata.userId
  });

  //Update post with the given id only if the creator is the one trying to update
  Post.updateOne({_id: req.params._id, creator: req.userdata.userId}, post)
  .then(result=>{

    //If the modification fails, a field of result, called nModified (number of modified)
    //is 0, else it is 1 (because function in updateOne)
    //We can use this to catch the failure in updation
    if (result.n > 0) {
      res.status(200).json({message: "Update successful"});
    }
    else {
      res.status(401).json({message: "Not authorized"});
    }
  })
  .catch((error) => {
    res.status(500).json({
      message: 'Post Updation Failed'
    })
  });
});

router.get('', (req, res, next)=>{
  /*const posts = [
    {_id: '1245fad', title: 'First Server post', content: 'This is the first post from the server side'},
    {_id: '1245fae', title: 'Second Server post', content: 'This is the second post from the server side'}
  ];*/

  //For pagination
  //NOTE:- All parameters from req.query would be string
  const pagesize = +req.query.pagesize;       //+ would convert the string to int if possible
  const currentpage = +req.query.page;
  //We have to alter the query we use to fetch the posts
  //Hence create a new post query
  const Postquery = Post.find();
  console.log(req.query);
  if(pagesize && currentpage){
    Postquery
      .skip(pagesize * (currentpage - 1))
      .limit(pagesize);
      //NOTE!!!
      //This still processes all elements of the database.
      //Hence, inefficient for large databases
  }

  let fetchedposts;

  Postquery
    .then(documents=>{
      fetchedposts = documents;
      //The return of this then part would be used as an argument for the next then part
      return Post.count();
    })
    .then(count=>{
      //console.log(documents);
      return res.status(200).json({
        message: 'Posts fetched successfully',
        posts: fetchedposts,
        maxPosts: count
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Could\'t fetch posts'
      })
    });
});

router.get('/:_id', (req, res, next)=>{
  Post.findById(req.params._id)
  .then(post=>{
    if(post!=null){
      res.status(200).json(post);
    }
    else{
      res.status(404).json({message: 'Post not found'});
    }
  })
  .catch((error) => {
    res.status(500).json({
      message: 'Could\'t fetch the post'
    })
  });
});

router.delete('/:_id', checkauth, (req, res, next)=>{
  //console.log(req.params._id);
  Post.deleteOne({_id: req.params._id, creator: req.userdata.userId})
  .then(result => {
    //If the modification fails, a field of result, called n (number of deleted)
    //is 0, else it is 1 (because function in deleteOne)
    //We can use this to catch the failure in updation
    if (result.n > 0) {
      res.status(200).json({message: "Post deletion successful"});
    }
    else {
      res.status(401).json({message: "Not authorized"});
    }
  })
  .catch((error) => {
    res.status(500).json({
      message: 'Could\'t delete the post'
    })
  });
});

module.exports = router;
