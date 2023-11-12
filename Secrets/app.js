//jshint esversion:6

// Level 2: encryption - all secrets in .env
import 'dotenv/config';

// Level 2: encryption - mongoose encryption plugin
import encrypt from 'mongoose-encryption';

// Level 3: hashing with md5
import md5 from "md5";

// Level 4: hashing with bcrypt - community standard
import bcrypt from "bcrypt";
const saltRounds = 12;

import express from 'express';
import bodyParser from 'body-parser';
import mongoose from "mongoose";

const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

const port = 3003;
let User; 
async function initDB() {
    try {
        await mongoose.connect("mongodb://localhost:27017/userDB");

        // Level 1: plain user registration
        const userSchema = new mongoose.Schema({
            email: String, 
            password: String,
        });

        // Level 2: encryption - using mongoose plugin 
        // If we use level 3 or higher - hashing - encryption should be removed
        // userSchema.plugin(encrypt, {secret: process.env.ENCRYPTION_KEY, encryptedFields: ['password', ], });

        User = mongoose.model("User", userSchema);

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

app.post('/register', async (req, res) => {
    const email = req.body.username;
    const password = req.body.password;

    // Level 1: plain user registration
    /* const newUser = new User({email: email, password: password}); */

    // Level 3: simple hashing (with md5)
    // const newUser = new User({email: email, password: md5(req.body.password)});

     // Level 4: standard hashing (with bcrypt) 
    const hash = await bcrypt.hash(password, saltRounds) 
    const newUser = new User({email: email, password: hash});

    try {
        await newUser.save();
        res.render('secrets.ejs');
    } catch (error) {
        console.error(error);
        res.status(400).json({message: 'User not created'});
    }
});

app.post('/login', async (req, res) => {
    const email = req.body.username;
    const password = req.body.password;

    // Level 1: plain user registration (also suitable for level 2, as decryption happens automatically)
    /* try {
        const foundUser = await User.findOne({email: email});
        if (foundUser) {
            if(foundUser.password === password) {
                res.render('secrets.ejs');
            } else {
                res.status(404).json({message: 'Invalid Password.'});
            }
        } else {
            res.status(404).json({message: 'User not found'});
        } */

        // Level 3: simple hashing (with md5) 
        /* try {
            const foundUser = await User.findOne({email: email});
            if (foundUser) {
                if(foundUser.password === md5(req.body.password)) {
                    res.render('secrets.ejs');
                } else {
                    res.status(404).json({message: 'Invalid Password.'});
                }
            } else {
                res.status(404).json({message: 'User not found'});
            } */

        // Level 4: standard hashing (with bcrypt) 
        try {
            const foundUser = await User.findOne({email: email});
            if (foundUser) {
                const match = await bcrypt.compare(password, foundUser.password);
    
                if (match) {
                    res.render('secrets.ejs');
                } else {
                    res.status(404).json({message: 'Invalid Password.'});
                }
            } else {
                res.status(404).json({message: 'User not found'});
            }
    } catch (error) {
        console.error(error);
        res.status(404).json({message: 'User not found'});
    }
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