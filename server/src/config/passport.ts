import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User';

export const configurePassport = () => {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });

      if (user) {
        return done(null, user);
      } else {
        const existingUser = await User.findOne({ email: profile.emails ? profile.emails[0].value : '' });
        if (existingUser) {
          return done(new Error("Email already in use with a different login method."), false);
        }

        const newUser = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails ? profile.emails[0].value : '',
        });
        return done(null, newUser);
      }
    } catch (err) {
      return done(err, false);
    }
  }));
};