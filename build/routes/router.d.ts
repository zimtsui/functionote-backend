/// <reference types="koa__router" />
import KoaRouter = require('@koa/router');
import { FileRouterState } from './files';
import { KoaStateAuth } from './subscriptions';
import Database = require('better-sqlite3');
declare type RouterState = KoaStateAuth & FileRouterState;
export declare class Router extends KoaRouter<RouterState> {
    private fileRouter;
    private s10nRouter;
    constructor(db: Database.Database);
}
export {};
