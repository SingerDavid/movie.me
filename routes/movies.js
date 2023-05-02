const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('../models/User');


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

/* GET movies page. */
router.get('/', ensureAuthenticated, function(req, res, next) {
  console.log(req.session);
  const user = req.user; // Passport adds the user object to the request object and pull data from session
  const likedMovies = user.likedMovies || []; // get the likedMovies array, or an empty array if it does not exist - error prevention
  const recommendedMovies = user.recommendedMovies || [];
  res.render('movies', { title: 'User Profile', user: user, likedMovies: likedMovies, recommendedMovies :  recommendedMovies});
});

module.exports = router;
