import KoaPassport = require('koa-passport');
import PassportHttp = require('passport-http');
import { Users } from './users';



export function createAuthentication(users: Users) {
    const passport = new KoaPassport.Passport();
    const basicAuth = new PassportHttp.BasicStrategy((username, password, done) => {
        try {
            const userProfile = users.getUserProfileByName(username);
            if (password === userProfile.password)
                done(null, userProfile.id);
            else
                done(null, false);
        } catch (err) {
            done(null, false);
        }
    });
    passport.use(basicAuth);
    return passport.authenticate('basic', { session: false });
}
