import Koa = require('koa');
import { Router } from './routes/router';
import Database = require('better-sqlite3');
import { FunctionalFileSystem } from './ffs/ffs';
import { Passport } from './auth';
import { Users } from './users';
import KoaRouter = require('@koa/router');


type KoaRouterContext<
    StateT = Koa.DefaultState,
    ContextT = Koa.DefaultContext,
    > = Parameters<KoaRouter.Middleware<StateT, ContextT>>[0];


export class App extends Koa {
    private db = new Database('../functionote.db', { fileMustExist: true });
    private ffs = new FunctionalFileSystem(this.db);
    private users = new Users(this.db);
    private router = new Router(this.ffs, this.users);
    private passport = new Passport(this.users);

    constructor() {
        super();
        this.use(this.passport.initialize());
        this.use(this.passport.authenticate('basic', { session: false }));
        this.use(this.router.routes());
    }
}
