/// <reference types="koa__router" />
import KoaRouter = require('@koa/router');
import { FunctionalFileSystem } from '../ffs/ffs';
import { Users } from '../users';
export declare class Router extends KoaRouter {
    private fileRouter;
    private subscriptionRouter;
    constructor(ffs: FunctionalFileSystem, users: Users);
}
