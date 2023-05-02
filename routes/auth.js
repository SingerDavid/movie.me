const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('../models/User');

async function localAuth(email, password, callback) {
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return callback(null, false);
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
          return callback(null, false);
        }
        return callback(null, user);

    } catch (error) {
        console.log(error);
        return callback(error, false);
    }
}

//I have plenty of options for what to serialize, for now just the user in its whole. I found the best way to do it online and will change it for real use.
// serialize user object to session
passport.serializeUser(function(user, callback) {
    callback(null, user);
});

// deserialize user object from session
passport.deserializeUser(function(user, callback) {
    callback(null, user);
});

//pass { because we are using email and not username, pulling from form field }
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: "password",
}, localAuth));

/* GET login page. */
router.get('/login', function(req, res, next) {
  res.render('login');
});

/* POST local login */
router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      const errorMessage = 'Incorrect username or password';
      return res.render('login', { errorMessage: errorMessage });
    }
    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
      return res.redirect('/users');
    });
  })(req, res, next);
});

/* POST logout */
router.post('/logout', function(req, res, next) {
    req.logout(function(error) {
        if (error) { return next(error); }
        res.redirect('/login');
    });
});

/* GET signup form. */
router.get('/signup', function(req, res, next) {
    res.render('signup');
});

/* POST sign-up */
router.post('/signup', async function(req, res, next) {
    try {
      const { email, password } = req.body;

      // check if user already exists
      const existingUser = await User.findOne({ email: email });
      if (existingUser) {
        res.render('signup', { message: 'Email already registered' });
      } else {
        // create new user
        const newUser = new User({
          email: email,
          password: password,
        });

        // save user to database
        await newUser.save();

        // log in user
        req.login(newUser, function(err) {
          if (err) {
            return next(err);
          }
          res.redirect('/users');
        });
      }
    } catch (error) {
      console.log(error);
      return next(error);
    }
  });

module.exports = router;