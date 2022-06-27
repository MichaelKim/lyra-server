import { PassportStatic } from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { findUser, findUserById } from './database';

export function initPassport(passport: PassportStatic) {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await findUserById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  passport.use(
    'local',
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await findUser(username, password);
        done(null, user);
      } catch (err) {
        done(err);
      }
    })
  );
}
