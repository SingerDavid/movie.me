require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const User = require('./models/User');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');

mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@fullstack.qxqehe4.mongodb.net/movieapp?retryWrites=true&w=majority`)
  .then(()=>{
    console.log('Database connection successful!');
  })
  .catch((err)=>{
    console.log('Database connection error');
  });

const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const moviesRouter = require('./routes/movies');
const resultsRouter = require('./routes/results');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.redirect('/login');
});

// set up session middleware
app.use(session({
  secret: 'mysecretkey',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongooseConnection: mongoose.connection,
    mongoUrl: `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@fullstack.qxqehe4.mongodb.net/movieapp?retryWrites=true&w=majority`
  })
}));

// use passport middleware after session middleware
app.use(passport.initialize());
app.use(passport.session());

app.use('/', authRouter);
app.use('/users', usersRouter);
app.use('/movies', moviesRouter);
app.use('/results', resultsRouter);
app.use(express.static('public'));
app.use(express.static('javascripts'));


// create a new user
// let newUser = new User({
//   email: 'example@example.com',
//   password: 'password123',
//   likedMovies: ['The Shawshank Redemption', 'The Godfather'],
//   recommendedMovies: [
//     {
//       title: 'The Dark Knight',
//       year: 2008,
//       genre: 'Action',
//       watchLocations: ['Netflix', 'Amazon Prime'],
//       description: 'The Joker wreaks havoc on Gotham City and pushes Batman to his limits.'
//     },
//     {
//       title: 'Inception',
//       year: 2010,
//       genre: 'Sci-Fi',
//       watchLocations: ['HBO Max', 'Google Play'],
//       description: 'A thief enters people\'s dreams to steal their secrets in this mind-bending thriller.'
//     }
//   ]
// });
// save the new user to the database
//newUser.save()

//test match password
// define a function to test the password
// async function testPassword(email, password) {
//   try {
//     // find the user by email
//     const user = await User.findOne({ email });

//     // if the user doesn't exist, return false
//     if (!user) {
//       console.log('User not found');
//       return false;
//     }

//     // check if the provided password matches the user's password
    // const isMatch = await user.matchPassword(password);

    // if (isMatch) {
    //   console.log('Password matched');
    //   return true;
    // } else {
    //   console.log('Password does not match');
    //   return false;
    // }
//   } catch (error) {
//     console.error('Error testing password:', error);
//     return false;
//   }
// }

// // call the testPassword function
// testPassword('example@example.com', 'password123');


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
