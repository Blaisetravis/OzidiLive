const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt'); // Import bcrypt here
const users = require('./models/User');

function initialize(passport) {
    const authenticateUser = async (email, password, done) => {
        const user = await users.findOne({ email: email }); // Check the database for a user with the email

        if (user == null) {
            return done(null, false, { message: 'No user with that email' });
        }

        try {
            
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Password incorrect' });
            }
        } catch (err) {
            return done(err);
        }
    };

    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await users.findById(id); // Use findById with await
            done(null, user); // Pass the user to the done callback
        } catch (err) {
            done(err); // Handle error
        }
    });
}

module.exports = initialize;
