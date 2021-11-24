/// <reference types="koa-passport" />
/// <reference types="koa-session" />
import Koa = require('koa');
import Database = require('better-sqlite3');
export declare class App extends Koa {
    private db;
    private ffs;
    private users;
    private router;
    private passport;
    constructor(db: Database.Database);
}
