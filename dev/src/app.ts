import Koa = require('koa');
import { Router } from '../..';
import Database = require('better-sqlite3');
import Cors = require('@koa/cors');


export class App extends Koa {
    private router = new Router(this.db);

    constructor(private db: Database.Database) {
        super();
        this.use(Cors({
            origin: 'http://localhost:1234',
            exposeHeaders: ['Root-File-Id'],
            credentials: true,
        }));
        this.use(async (ctx, next) => {
            ctx.state.user = 1;
            await next();
        });
        this.use(this.router.routes());
    }
}
