import KoaPassport = require('koa-passport');
import PassportHttp = require('passport-http');
import { Users } from './users';


export class Passport extends KoaPassport.KoaPassport {
    constructor(users: Users) {
        super();
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
        this.use(basicAuth);
    }
}
