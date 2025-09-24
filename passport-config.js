require('dotenv').config();
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('./user_schema');

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL || "http://localhost:3000/auth/github/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      //check if user already exists in db
      let existing_user = await User.findOne({ githubId: profile.id });
      
      if (existing_user) {
        return done(null, existing_user);
      }
      
      // Create new user
      const new_user = new User({
        githubId: profile.id,
        name: profile.displayName || profile.username,
        username: profile.username,
        avatar: profile.photos[0] ? profile.photos[0].value : null,
        image: '',
        birthday: '',
        age: 0,
        zodiac: ''
      });
      
      const saved_user = await new_user.save();
      return done(null, saved_user);
    } catch (error) {
      return done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;