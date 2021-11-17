/// <reference types="node" />
/// <reference types="koa__router" />
import KoaRouter = require('@koa/router');
import { BranchId, FileId } from './interfaces';
import { FunctionalFileSystem } from './ffs/ffs';
export interface State {
    branch: BranchId;
    root: FileId;
    time: number;
    path: string[];
    body: Buffer;
}
export declare class Router extends KoaRouter<State> {
    constructor(ffs: FunctionalFileSystem);
}
