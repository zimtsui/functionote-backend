/// <reference types="node" />
/// <reference types="koa__router" />
import KoaRouter = require('@koa/router');
import { BranchId, FileId } from '../interfaces';
import { FunctionalFileSystem } from '../ffs/ffs';
import { Users } from '../users';
import '../ffs/interfaces';
export interface FileRouterState {
    branch: BranchId;
    root: FileId;
    time: number;
    path: string[];
    body: Buffer;
}
export declare class FileRouter extends KoaRouter<FileRouterState> {
    private ffs;
    private users;
    constructor(ffs: FunctionalFileSystem, users: Users);
    private validateBranch;
}
