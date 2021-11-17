/// <reference types="koa-passport" />
import Koa = require('koa');
export declare class Server extends Koa {
    private db;
    private ffs;
    private router;
    constructor();
}
