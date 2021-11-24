import Koa = require('koa');
import { Router } from './routes/router';
import Database = require('better-sqlite3');
import { FunctionalFileSystem } from 'ffs';
import { Passport } from './auth';
import { Users } from './users';
import Cors = require('@koa/cors');
import Session = require('koa-session');


export class App extends Koa {
    private ffs = new FunctionalFileSystem(this.db);
    private users = new Users(this.db);
    private router = new Router(this.ffs, this.users);
    private passport = new Passport(this.users);

    constructor(private db: Database.Database) {
        super();
        // this.use(Cors({
        //     origin: 'http://localhost:1234',
        //     exposeHeaders: ['Root-File-Id'],
        //     credentials: true,
        // }));
        this.use(Session({
            signed: false,
            overwrite: false,
        }, this));

        this.use(async (ctx, next) => {
            ctx.state.user = 1;
            await next();
        })
        this.use(this.passport.initialize());
        this.use(this.passport.session());
        this.use(this.passport.authenticate('basic', { session: true }));

        this.use(this.router.routes());
    }
}
