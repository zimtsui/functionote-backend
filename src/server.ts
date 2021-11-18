import Koa = require('koa');
import {
    ProfileRouter, FileRouter,
    FileRouterState, ProfileRouterContext,
} from './routes';
import Database = require('better-sqlite3');
import { FunctionalFileSystem } from './ffs/ffs';
import { createAuthentication } from './auth';
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
    private profileMiddleware = new ProfileRouter(this.users).routes();
    private fileMiddleware = new FileRouter(this.ffs, this.users).routes();
    private passportMiddleware = createAuthentication(this.users);

    constructor() {
        super();
        this.use(this.passportMiddleware);
        this.use(async (ctx, next) => {
            if (ctx.headers['branch-id'] !== undefined)
                await this.fileMiddleware(
                    <KoaRouterContext<FileRouterState, ProfileRouterContext>>ctx,
                    next,
                );
            else
                await this.profileMiddleware(
                    <KoaRouterContext<{}, ProfileRouterContext>>ctx,
                    next,
                );
        });
    }
}
