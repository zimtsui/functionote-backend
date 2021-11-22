import Koa = require('koa');
import { Router } from './routes/router';
import Database = require('better-sqlite3');
import { FunctionalFileSystem } from './ffs/ffs';
import { Passport } from './auth';
import { Users } from './users';
import Cors = require('@koa/cors');
import Session = require('koa-session');


export class App extends Koa {
    private db = new Database('../functionote.db', { fileMustExist: true });
    private ffs = new FunctionalFileSystem(this.db);
    private users = new Users(this.db);
    private router = new Router(this.ffs, this.users);
    private passport = new Passport(this.users);

    constructor() {
        super();
        this.use(Cors());
        this.use(Session({
            signed: false,
            overwrite: false,
        }, this));
        this.use(this.passport.initialize());
        // this.use(this.passport.session());
        // this.use(this.passport.authenticate('basic', { session: true }));
        this.use(this.router.routes());
    }
}
