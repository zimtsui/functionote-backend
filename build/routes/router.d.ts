/// <reference types="koa__router" />
import KoaRouter = require('@koa/router');
import { FunctionalFileSystem } from 'ffs';
import { Users } from '../users';
import { FileRouterState } from './files';
declare type RouterState = KoaStateAuth & FileRouterState;
interface KoaStateAuth {
    user: number;
}
export declare class Router extends KoaRouter<RouterState> {
    private fileRouter;
    constructor(ffs: FunctionalFileSystem, users: Users);
}
export {};
