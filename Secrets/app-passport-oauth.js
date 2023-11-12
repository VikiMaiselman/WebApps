//jshint esversion:6

// Level 2: encryption - all secrets in .env
import 'dotenv/config';

import express from 'express';
import bodyParser from 'body-parser';
import mongoose from "mongoose";

import session from 'express-session';
import passport from 'passport';
import passportLocalMongoose from 'passport-local-mongoose';

// import our passport strategy
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

// import implementation of findorcreate 
import findOrCreate from 'mongoose-findorcreate';

const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

const port = 3003;
let User; 

// 1. Configure a potential session
app.use(session({
    secret: process.env.PASSPORT_SECRET,
    resave: false,
    saveUninitialized: false,
}));

// 2. Initialize the passport middleware 
app.use(passport.initialize());
// We want the app to use passport to initialize the session
app.use(passport.session());

async function initDB() {
    try {
        await mongoose.connect("mongodb://localhost:27017/userDB");

        const userSchema = new mongoose.Schema({
            username: String, 
            password: String,
            googleId: String,
            secret: String,
        });

        // 3. Initialize passportLocalMongoose, it will be used to hash & salt our passwords
        // before saving users to MongoDB
        userSchema.plugin(passportLocalMongoose);

        // ! add findorcreate plugin to the user
        userSchema.plugin(findOrCreate);

        User = mongoose.model("User", userSchema);

        // 4. Configure passport-local stategy
        passport.use(User.createStrategy()); // creates local login strategy (there are different strategies, eg login with google etc.)

        passport.serializeUser(function(user, cb) {
            process.nextTick(function() {
              cb(null, { id: user.id, username: user.username });
            });
          });
          
          passport.deserializeUser(function(user, cb) {
            process.nextTick(function() {
              return cb(null, user);
            });
          });

        // ! Configure Google Stratrgy
        passport.use(new GoogleStrategy({
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: "http://localhost:3003/auth/google/secrets", // of the redirect URI
            userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
          },
          function(accessToken, refreshToken, profile, cb) {
            console.log(profile.id)
            // this is not a real mongoose function, you can implement this function or 
            // import it from mongoose-findorcreate package (implemented for you)
            User.findOrCreate({ googleId: profile.id }, function (err, user) {
              return cb(err, user);
            });
          }
        ));

    } catch (error) {
        console.error(error);
    }
}
initDB();

app.get('/', (req, res) => {
    res.render('home.ejs');
});

// route for log in and register with google buttons
app.get('/auth/google', 
    // similar to what we did in register and login - we authenticated the users on registration or login
    // here we authenticate them when the button sign in with google is pressed
    // 'authenticate the user with google strategy, configured earlier, and when we hit google, use user's profile'
    // this is the function that brings up pop-up of registering in google
    passport.authenticate("google", { scope: ['profile'] })
);

app.get('/auth/google/secrets', 
  // authentication of the user after they've returned from google page
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    console.log(res);
    res.redirect('/secrets');
});

app.get('/submit', (req, res) => {
    if (!req.isAuthenticated()) {
        res.redirect('/login');
    } else {
        res.render('submit.ejs');
    }
});

app.post('/submit', async (req, res) => {
    const newSecret = req.body.secret

    // passport stores for us info about the currently logged in user (in this session)
    console.log(req.user);

    const foundUser = await User.findById({_id: req.user.id});

    if (!foundUser) {
        res.redirect('/');
        return;
    } else {
        foundUser.secret = newSecret;
        await foundUser.save();
        res.redirect('/secrets');
    }
});

app.get('/register', (req, res) => {
    res.render('register.ejs');
});

app.get('/login', (req, res) => {
    res.render('login.ejs');
});

app.get('/secrets', async(req, res) => {
    const secrets = await User.find({'secret': {$exists: true}});
    res.render('secrets.ejs', {allSecrets: secrets});
});

app.get('/logout', (req, res, next) => {
    // also passport performs the logout, also on req
    req.logout(function(err) {
        if (err) { 
            return next(err); 
        }
        res.redirect('/');
      });
});

// password local mongoose package will deal with logins & registration
app.post('/register', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // a method provided by the package, abstracts away our interaction with DB
    User.register({username: username}, password, function(err, user) {
        if (err) {
            console.error(err);
            res.redirect('/register');
            return;
        }

        // if we are here - the user created sucessfully, now we will authenticate him
        passport.authenticate("local")(req, res, function() {
            // the callback will be triggered only if authentication was successful
            // so we can safely redirect the user to the secrets page
            res.redirect('/secrets');
        })

    })
});

app.post('/login', async (req, res) => {
    const email = req.body.username;
    const password = req.body.password;

    const user = new User({
        username: email, password: password
    });

    // passport package does the login, but it does in on req param
    req.login(user, function(err) {
        if (err) {
            // the user was not found in the DB
            console.error(err);
            res.redirect('/login');
            return;
        } 
        
        // if we are here - the user was found sucessfully, now we will authenticate him
        passport.authenticate("local")(req, res, function() {
            // the callback will be triggered only if authentication was successful
            // so we can safely redirect the user to the secrets page
            res.redirect('/secrets');
        })
    })
});


app.listen(port, () => {
    console.log(`Server is up and listening on port ${port}.`)
});

process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('Mongoose connection is disconnected due to application termination');
        process.exit(0);
    } catch (error) {
        console.error(error);
    }
});