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

/* GET users profile. */
router.get('/', ensureAuthenticated, async function(req, res, next) {
  console.log('back inside user profile....');
  const user = await User.findById(req.user._id);
  const likedMovies = user.likedMovies || []; // get the likedMovies array, or an empty array if it does not exist - error prevention
  const recommendedMovies = user.recommendedMovies || [];
  res.render('users', { title: 'User Profile', user: user, likedMovies: likedMovies, recommendedMovies :  recommendedMovies});
  //res.render('users', { title: 'User Info', user: JSON.stringify(req.session.passport.user, null, 2) }); //lets us see the data in the template and format it
});

/* POST add favorite movie */
router.post('/add-movie', async function(req, res, next) {
  console.log("MADE IT HERE ---------------");
  const user = req.user; // Passport adds the user object to the request object and pull data from session
  const movieName = req.body.movieName;
  const likedMovies = user.likedMovies || [];

  if (likedMovies.length >= 5) {
    // Limit reached, send error message
    const errorMessage = "You have reached the limit of 5 favorite movies.";
    res.render('users', { title: 'User Profile', user: user, likedMovies: likedMovies, errorMessage: errorMessage });
  } else {
    // Add the movie to the user's liked movies in the database
    likedMovies.push(movieName);
    const updatedUser = await User.findByIdAndUpdate(user._id, { likedMovies: likedMovies }, { new: true });

    console.log('User updated:', updatedUser);
    res.redirect('/users');
  }
});

/* POST remove favorite movie */
router.post('/remove-movie', async function(req, res, next) {
  const user = req.user;
  const movieName = req.body.movieName;
  const likedMovies = user.likedMovies || [];

  // Remove the movie from the user's liked movies in the database
  const movieIndex = likedMovies.indexOf(movieName);
  if (movieIndex > -1) {
    likedMovies.splice(movieIndex, 1);
  }
  const updatedUser = await User.findByIdAndUpdate(user._id, { likedMovies: likedMovies }, { new: true });

  console.log('User updated:', updatedUser);
  res.redirect('/users');
});

/* POST remove recommendation*/
router.post('/no-interest', async function(req, res, next) {
  console.log('back inside remove movie....');
  const user = req.user;
  const title = req.body.title;
  const recommendedMovies = user.recommendedMovies || [];
  console.log('MOVIES RECS:', title, recommendedMovies);
  // Find the index of the movie in the recommendedMovies array
  const movieIndex = recommendedMovies.findIndex(movie => movie.title === title);

  if (movieIndex > -1) {
    // Remove the movie from the array
    recommendedMovies.splice(movieIndex, 1);
  }

  const updatedUser = await User.findByIdAndUpdate(user._id, { recommendedMovies: recommendedMovies }, { new: true });

  console.log('User updated:', updatedUser);
  res.redirect('/users');
});

module.exports = router;
