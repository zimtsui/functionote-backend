import { FunctionalFileSystem } from './ffs';
import KoaPassport = require('koa-passport');
import PassportHttp = require('passport-http');


export function createPassportMiddleware(ffs: FunctionalFileSystem) {
    const passport = new KoaPassport.Passport();
    const basicAuth = new PassportHttp.BasicStrategy((username, password, done) => {
        try {
            const userProfile = ffs.getUserProfile(username);
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
