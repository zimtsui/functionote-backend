import Koa = require('koa');
import { Router } from './routes';
import Database = require('better-sqlite3');
import { FunctionalFileSystem } from './ffs/ffs';
import { createPassportMiddleware } from './auth';
import { Users } from './users';


export class Server extends Koa {
    private db = new Database('./functionote.db', { fileMustExist: true });
    private ffs = new FunctionalFileSystem(this.db);
    private router = new Router(this.ffs);
    private users = new Users(this.db);
    private passportMiddleware = createPassportMiddleware(this.users);

    constructor() {
        super();
        this.use(this.passportMiddleware);
        this.use(this.router.routes());
    }
}
