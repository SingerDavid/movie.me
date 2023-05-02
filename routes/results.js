require('dotenv').config();
const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('../models/User');
const { Configuration, OpenAIApi } = require('openai');


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

const configuration = new Configuration({
  organization: "org-S8HBoa7hQyYEgYNOpXeFY2p0",
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

console.log(openai);

// const moviedata = [
//   {
//     title: 'The Shawshank Redemption',
//     year: 1994,
//     genre: 'Drama',
//     watchLocations: ['Netflix', 'Amazon Prime'],
//     description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.'
//   },
//   {
//     title: 'The Godfather',
//     year: 1972,
//     genre: 'Drama',
//     watchLocations: ['Netflix', 'HBO Max'],
//     description: 'An organized crime dynasty\'s aging patriarch transfers control of his clandestine empire to his reluctant son.'
//   },
//   {
//     title: 'The Dark Knight',
//     year: 2008,
//     genre: 'Action',
//     watchLocations: ['Netflix', 'Amazon Prime'],
//     description: 'The Joker wreaks havoc on Gotham City and pushes Batman to his limits.'
//   },
//   {
//     title: 'Inception',
//     year: 2010,
//     genre: 'Sci-Fi',
//     watchLocations: ['HBO Max', 'Google Play'],
//     description: 'A thief enters people\'s dreams to steal their secrets in this mind-bending thriller.'
//   }
// ]

async function runCompletion (prompt) {
    const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{"role": "system", "content":"I am a movie expert, give me some information and I will find some movies curated to you!"},{'role': 'user', 'content': prompt}],
  });
    console.log(completion.data.choices[0].message);
    console.log(completion.data.choices[0].message.content);

    const jsonString = completion.data.choices[0].message.content;

    function extractMovies(jsonString) {
        const parsedData = JSON.parse(jsonString);
        const movies = parsedData.movies;

        const reformattedMovies = movies.map(movie => {

          const watchLocations = movie.where_to_watch ? movie.where_to_watch.split(', ') : 'Unable to Locate';
          return {
              title: movie.title,
              year: movie.release_year,
              genre: movie.genre,
              description: movie.description,
              watchLocations: watchLocations
          };
        });

        return reformattedMovies;
    }
    const results = extractMovies(jsonString);
    console.log(results);
    return results;
}


/* GET results page. */
router.get('/', ensureAuthenticated, async function(req, res, next) {
  res.render('results', { title: 'User Profile', recommendedMovies: [], searchType: '', genre: '', yearRange: '', actor: '', description: '' });
});

/* POST results page. */
router.post('/', async function(req, res, next) {
  const user = await User.findById(req.user._id);
  const favoriteMovies = user.likedMovies || [];
  const likedMovies = user.recommendedMovies || [];
  const { searchType, genre, yearRange, actor, description } = req.body;

  movieSearch = '';
  if (searchType === "favorite movies") {
    movieSearch = favoriteMovies.join(", ");
  } else {
    let titles = '';
    likedMovies.forEach(movie => {
      titles += movie.title + ', ';
    });
    // Remove the last comma and space
    titles = titles.slice(0, -2);
    movieSearch = likedMovies.join(", ");
  }

  prompt = `My current top favorite movies are ${movieSearch}. Here is some other search criteria I want -> genre: ${genre}, release year: ${yearRange}, actor: ${actor}, and some additional detail I want: ${description}. Please give me the output in JSON format with movie title | release year | genre type  | where to watch the movie but split each with a comma | short description. Just give me the JSON format, no other text.`;

  try {
    const recommendedMovies = await runCompletion(prompt);
    console.log("Recommended movies: ", recommendedMovies);
    res.render('results', { title: 'User Profile', recommendedMovies, searchType, genre, yearRange, actor, description });
  } catch (err) {
    console.error(err);
    res.render('results', { title: 'User Profile', recommendedMovies: [], searchType, genre, yearRange, actor, description, error: 'Sorry, we are experiencing high API demand. Please try again later. Our movie gods need time to sort their files.' });
  }
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
