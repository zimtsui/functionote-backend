import Koa = require('koa');
import { Router } from './route';
import Database = require('better-sqlite3');
import { FunctionalFileSystem } from './ffs';
import { createPassportMiddleware } from './auth';


export class Server extends Koa {
    private db = new Database('./functionote.db', { fileMustExist: true });
    private ffs = new FunctionalFileSystem(this.db);
    private router = new Router(this.ffs);

    constructor() {
        super();
        this.use(createPassportMiddleware(this.ffs));
        this.use(this.router.routes());
    }
}
