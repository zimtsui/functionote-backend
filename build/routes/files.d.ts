/// <reference types="node" />
/// <reference types="koa__router" />
import KoaRouter = require('@koa/router');
import { BranchId } from '../interfaces';
import { FnodeId } from 'ffs';
import { FunctionalFileSystem } from 'ffs';
import { Users } from '../users';
export interface FileRouterState {
    branch: BranchId;
    root: FnodeId;
    time: number;
    path: string[];
    body: Buffer;
}
export declare class FileRouter extends KoaRouter<FileRouterState> {
    private users;
    constructor(ffs: FunctionalFileSystem, users: Users);
    private validateBranch;
}
