/// <reference types="node" />
/// <reference types="koa__router" />
import KoaRouter = require('@koa/router');
import { BranchId, FileId } from './interfaces';
import { FunctionalFileSystem } from './ffs/ffs';
import { Users } from './users';
export interface FileRouterState {
    branch: BranchId;
    root: FileId;
    time: number;
    path: string[];
    body: Buffer;
}
export interface ProfileRouterContext {
    req: {
        user: number;
    };
}
export declare class ProfileRouter extends KoaRouter<{}, ProfileRouterContext> {
    constructor(users: Users);
}
export declare class FileRouter extends KoaRouter<FileRouterState, ProfileRouterContext> {
    private ffs;
    private users;
    constructor(ffs: FunctionalFileSystem, users: Users);
    private validateBranch;
}
