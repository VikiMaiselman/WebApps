//jshint esversion:6

// Level 2: encryption - all secrets in .env
import 'dotenv/config';

import express from 'express';
import bodyParser from 'body-parser';
import mongoose from "mongoose";

import session from 'express-session';
import passport from 'passport';
import passportLocalMongoose from 'passport-local-mongoose';

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
            email: String, 
            password: String,
        });

        // 3. Initialize passportLocalMongoose, it will be used to hash & salt our passwords
        // before saving users to MongoDB
        userSchema.plugin(passportLocalMongoose);

        User = mongoose.model("User", userSchema);

        // 4. Configure passport-local
        passport.use(User.createStrategy()); // creates local login strategy (there are different strategies, eg login with google etc.)

        passport.serializeUser(User.serializeUser()); // creates session cookie
        passport.deserializeUser(User.deserializeUser()); // cracks session cookie to obtain info 

    } catch (error) {
        console.error(error);
    }
}
initDB();

app.get('/', (req, res) => {
    res.render('home.ejs');
});

app.get('/register', (req, res) => {
    res.render('register.ejs');
});

app.get('/login', (req, res) => {
    res.render('login.ejs');
});

app.get('/secrets', (req, res) => {
    // this function checks whether a user has been successfully authenticated 
    // (each time the user tries to reach it)
    if (!req.isAuthenticated()) {
        res.redirect('/login');
    } else {
        res.render('secrets.ejs');
    }
});

app.get('/logout', (req, res, next) => {
    // also passport performs the logout, also on req
    req.logout(function(err) {
        if (err) { 
            return next(err); 
        }
        res.redirect('/');
      });
})

// password local mongoose package will deal with logins & registration
app.post('/register', async (req, res) => {
    const email = req.body.username;
    const password = req.body.password;

    // a method provided by the package, abstracts away our interaction with DB
    User.register({username: email}, password, function(err, user) {
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