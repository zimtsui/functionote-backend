/// <reference types="koa__router" />
import KoaRouter = require('@koa/router');
import { FunctionalFileSystem } from '../ffs/ffs';
import { Users } from '../users';
import { FileRouterState } from './files';
import { AuthState } from '../interfaces';
declare type RouterState = AuthState & FileRouterState;
export declare class Router extends KoaRouter<RouterState> {
    private fileRouter;
    private subscriptionRouter;
    constructor(ffs: FunctionalFileSystem, users: Users);
}
export {};
