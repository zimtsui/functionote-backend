"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthentication = void 0;
const KoaPassport = require("koa-passport");
const PassportHttp = require("passport-http");
function createAuthentication(users) {
    const passport = new KoaPassport.Passport();
    const basicAuth = new PassportHttp.BasicStrategy((username, password, done) => {
        try {
            const userProfile = users.getUserProfileByName(username);
            if (password === userProfile.password)
                done(null, userProfile.id);
            else
                done(null, false);
        }
        catch (err) {
            done(null, false);
        }
    });
    passport.use(basicAuth);
    return passport.authenticate('basic', { session: false });
}
exports.createAuthentication = createAuthentication;
//# sourceMappingURL=auth.js.map