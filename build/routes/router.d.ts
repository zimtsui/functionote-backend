/// <reference types="koa__router" />
import KoaRouter = require('@koa/router');
import { FunctionalFileSystem } from 'ffs';
import { Users } from '../users';
import { FileRouterState } from './files';
import { KoaStateAuth } from './subscriptions';
declare type RouterState = KoaStateAuth & FileRouterState;
export declare class Router extends KoaRouter<RouterState> {
    private fileRouter;
    private s10nRouter;
    constructor(ffs: FunctionalFileSystem, users: Users);
}
export {};
