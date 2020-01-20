const express = require('express');
const router = express.Router();
//const mongoose = require('mongoose');
//const db = 'mongodb://tanzeel_123:mydbpass@cluster0-shard-00-00-znt38.mongodb.net:27017,cluster0-shard-00-01-znt38.mongodb.net:27017,cluster0-shard-00-02-znt38.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority'
const jwt = require('jsonwebtoken');

/*mongoose.connect(db, { useNewUrlParser: true, useFindAndModify: false }, err => {
  if(err) {
    console.log('Error: '+err);
  }
  else {
    console.log('Successfully connected to mongodb');
  }
})*/

module.exports = router;
