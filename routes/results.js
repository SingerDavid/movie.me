const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('../models/User');

const moviedata = [
  {
    title: 'The Shawshank Redemption',
    year: 1994,
    genre: 'Drama',
    watchLocations: ['Netflix', 'Amazon Prime'],
    description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.'
  },
  {
    title: 'The Godfather',
    year: 1972,
    genre: 'Drama',
    watchLocations: ['Netflix', 'HBO Max'],
    description: 'An organized crime dynasty\'s aging patriarch transfers control of his clandestine empire to his reluctant son.'
  },
  {
    title: 'The Dark Knight',
    year: 2008,
    genre: 'Action',
    watchLocations: ['Netflix', 'Amazon Prime'],
    description: 'The Joker wreaks havoc on Gotham City and pushes Batman to his limits.'
  },
  {
    title: 'Inception',
    year: 2010,
    genre: 'Sci-Fi',
    watchLocations: ['HBO Max', 'Google Play'],
    description: 'A thief enters people\'s dreams to steal their secrets in this mind-bending thriller.'
  }
]

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

/* GET results page. */
router.get('/', ensureAuthenticated, function(req, res, next) {
  console.log(req.session);
  //const user = req.user; // Passport adds the user object to the request object and pull data from session
  //const likedMovies = user.likedMovies || []; // get the likedMovies array, or an empty array if it does not exist - error prevention
  const recommendedMovies = moviedata;
  const searchType = req.body.searchType;
  const genre = req.body.genre;
  const yearRange = req.body.yearRange;
  const actor = req.body.actor;
  const description = req.body.description;

  console.log("Results from form: ", searchType, genre, yearRange, description);
  res.render('results', { title: 'User Profile', recommendedMovies :  recommendedMovies, searchType : searchType, genre : genre, yearRange : yearRange, actor : actor, description : description });
});

/* POST results page. */
router.post('/', function(req, res, next) {
  //const user = req.user; // Passport adds the user object to the request object and pull data from session
  //const likedMovies = user.likedMovies || []; // get the likedMovies array, or an empty array if it does not exist - error prevention
  const recommendedMovies = moviedata;
  const searchType = req.body.searchType;
  const genre = req.body.genre;
  const yearRange = req.body.yearRange;
  const actor = req.body.actor;
  const description = req.body.description;

    console.log("Results from form: ", searchType, genre, yearRange, description);
    res.render('results', { title: 'User Profile', recommendedMovies :  recommendedMovies, searchType : searchType, genre : genre, yearRange : yearRange, actor : actor, description : description });
});

router.post('/addToWatch', async (req, res) => {
  try {
    const { title, year, genre, description, watchLocations } = req.body;
    const user = req.user;
    const movie = {
      title: title,
      year: year,
      genre: genre,
      description: description,
      watchLocations: watchLocations
    };
    // Update the recommendedMovies property in the user object
    user.recommendedMovies.push(movie);
    // Save the updated user object to the database
    const updatedUser = await User.findByIdAndUpdate(user._id, { recommendedMovies: user.recommendedMovies }, { new: true });
    req.login(updatedUser, function(err) {
      if (err) {
        console.error(err);
        res.status(500).send('Server error');
      } else {
        res.status(200).send('Added to watch list');
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


module.exports = router;
