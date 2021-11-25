/// <reference types="koa-passport" />
/// <reference types="koa-session" />
import Koa = require('koa');
import Database = require('better-sqlite3');
export declare class App extends Koa {
    private db;
    private router;
    constructor(db: Database.Database);
}
