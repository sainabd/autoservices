const mongoose = require('mongoose')
const validator = require('validator')
const passport = require('passport')
const hashPassword = require('passport-local-authenticate');
//const passportLocalMongoose = require('passport-local-mongoose')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const flash = require('connect-flash')


const passportLocalMongoose = require('passport-local-mongoose')

const userSchema = new mongoose.Schema({

    username: String,
    email: String,
    salt: String,
    hash: String,
    firstName: String,
    lastName: String,
    phoneNumber: String,
    terms: Boolean,
    provider: String,
    googleId: String,
    facebookId: String


})

userSchema.plugin(passportLocalMongoose)



const User = mongoose.model('User', userSchema)

passport.use(User.createStrategy());
 
passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
passport.deserializeUser(function(id, done) {
User.findById(id, function(err, user) {
    done(err, user);
});
});

// passport.use(new LocalStrategy(
//     function(username, password, done) {
//       User.findOne({ username: username }, function (err, user) {
//         if (err) { return done(err); }
//         if (!user) {
//           return done(null, false, { message: 'Incorrect username.' });
//         }
//         if (!user.validPassword(password)) {
//           return done(null, false, { message: 'Incorrect password.' });
//         }
//         return done(null, user);
//       });
//     }
//   ));

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "https://bogas-autoservices.herokuapp.com/auth/google/autoservices",
    userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo'
  },
    function(accessToken, refreshToken, profile, done) {
        User.findOne({
            'googleId': profile.id 
        }, function(err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                user = new User({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    provider: 'Google',
                    googleId: profile.id
                });
                user.save(function(err) {
                    if (err) console.log(err);
                    return done(err, user);
                });
            } else {
                return done(err, user);
            }
        });
    }
));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "https://bogas-autoservices.herokuapp.com/auth/facebook/autoservices",
    profileFields: ['email','displayName', 'first_name','last_name','gender','link', 'picture.type(large)', 'location']
  },
  function(accessToken, refreshToken, profile, done) {
    //console.log(profile)
    User.findOne({
        'facebookId': profile.id 
    }, function(err, user) {
        if (err) {
            return done(err);
        }
        if (!user) {
            user = new User({
                name: profile.displayName,
                email: profile.emails[0].value,
                provider: 'Facebook',
                facebookId: profile.id
            });
            user.save(function(err) {
                if (err) console.log(err);
                return done(err, user);
            });
        } else {
            return done(err, user);
        }
    });
  }
));


module.exports = User