"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Passport = void 0;
const KoaPassport = require("koa-passport");
const PassportHttp = require("passport-http");
class Passport extends KoaPassport.KoaPassport {
    constructor(users) {
        super();
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
        this.use(basicAuth);
    }
}
exports.Passport = Passport;
//# sourceMappingURL=auth.js.map