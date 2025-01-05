


require('dotenv').config({ path: '.env' });




const apiKey = process.env.API_KEY;
console.log('API KEY', apiKey);

//Node modules//
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const fetch = require('node-fetch');


const User = require('./models/User');
const initializePassport = require('./passport-config');


initializePassport(
    passport,
    async (email) => await User.findOne({ email }), // Fetch user by email
    async (id) => await User.findById(id)          // Fetch user by ID
);

//Mongo connection 
const MONGOURI = process.env.MONGO_URI; // Use the URI from the .env file

mongoose.connect(MONGOURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected...'))
.catch(err => console.error('MongoDB connection error:', err));

const app = express();

app.set('views', path.join(__dirname, 'mains'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false })); // To parse URL-encoded bodies
app.use(flash());                                // For flash messages
app.use(session({
    secret: process.env.SESSION_SECRET || 'MadeFromMud', 
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname, {
    index: false,
}));

app.use(express.static('public'));


function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        console.log('User is authenticated:', req.user); 
        return next();
    } else {
        console.log('User is not authenticated');
        res.redirect('/login');
    }
}

//This is for hiding movie derver links//

app.get('/api/movie-details/:movieId', async (req, res) => {
    const { movieId } = req.params;
    try{
        const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.API_KEY}`);
        const data = await response.json();
        res.json(data);
    }catch(error){
        console.error('error fetching movie details:', error);
        res.status(500).json({error: 'Failed to fetch movie details'});
    }
})

app.get('/index', checkAuthenticated, (req, res) => {
    res.render('index', {user: req.user});
});

app.get('/', checkAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'index.ejs'));
});

app.get('/account', checkAuthenticated, (req, res) => {
    res.render('account', { user: req.user });
});

app.get('/login', (req, res) => {
    const message = req.flash('error') || 'Invalid username or password';
    res.render('login', { message });
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/index',         
    failureRedirect: '/login',    
    failureFlash: true
}));

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash('error', 'Email already registered');
            return res.redirect('/register');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
        });

        await newUser.save(); 

        res.redirect('/login'); 
    } catch (err) {
        console.error(err);
        req.flash('error', 'Registration failed');
        res.redirect('/register');
    }
});

app.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/login'); 
    });
});


app.get('/config', (req, res) => {
    res.json({ apiKey: process.env.API_KEY});
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

