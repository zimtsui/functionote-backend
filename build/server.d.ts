/// <reference types="koa-passport" />
import Koa = require('koa');
export declare class App extends Koa {
    private db;
    private ffs;
    private users;
    private profileMiddleware;
    private fileMiddleware;
    private passport;
    constructor();
}
