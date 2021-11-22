/// <reference types="koa-passport" />
/// <reference types="koa-session" />
import Koa = require('koa');
export declare class App extends Koa {
    private db;
    private ffs;
    private users;
    private router;
    private passport;
    constructor();
}
