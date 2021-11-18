import KoaRouter = require('@koa/router');
import {
    BranchId, FileId,
} from './interfaces';
import { FunctionalFileSystem, ExternalError as FfsError } from './ffs/ffs';
import { getRawBody } from './raw-body';
import _ = require('lodash');
import { Users } from './users';
import assert = require('assert');
import { HttpError } from './http-error';
import {
    isRegularFileContentView,
} from './ffs/interfaces';
import './ffs/interfaces';


export interface FileRouterState {
    branch: BranchId;
    root: FileId;
    time: number;
    path: string[];
    body: Buffer;
}

export interface ProfileRouterState {
    user: number;
}


export class ProfileRouter extends KoaRouter<ProfileRouterState> {
    constructor(users: Users) {
        super();

        this.get('/branches', async (ctx, next) => {
            try {
                ctx.body = users.getSubscriptionsView(ctx.state.user);
            } catch (err) {
                ctx.status = 404;
            }
        });
    }
}


export class FileRouter extends KoaRouter<FileRouterState & ProfileRouterState> {
    constructor(
        private ffs: FunctionalFileSystem,
        private users: Users,
    ) {
        super();

        this.all('/:path*', async (ctx, next) => {
            try {
                assert(typeof ctx.headers['branch-id'] === 'string', new HttpError(400));
                ctx.state.branch = Number.parseInt(ctx.headers['branch-id']);
                assert(Number.isInteger(ctx.state.branch), new HttpError(400));

                assert(typeof ctx.headers['root-file-id'] === 'string', new HttpError(400));
                try {
                    ctx.state.root = BigInt(ctx.headers['root-file-id']);
                } catch (err) {
                    throw new HttpError(400);
                }

                ctx.state.body = await getRawBody(ctx.req);
                ctx.state.path = ctx.params.path
                    ? ctx.params.path.split('/')
                    : [];
                await next();
            } catch (err) {
                if (err instanceof HttpError) ctx.status = err.status;
                else if (err instanceof FfsError) ctx.status = 400;
                else throw err;
            }
        });

        this.get('/:path*', async (ctx, next) => {
            try {
                this.validateBranch(ctx.state.branch, ctx.state.root);
                const content = ffs.retrieveFileView(
                    ctx.state.root,
                    ctx.state.path[Symbol.iterator](),
                );
                if (isRegularFileContentView(content)) {
                    ctx.body = content.toString();
                    ctx.type = 'text/markdown';
                } else
                    ctx.body = content;
                await next();
            } catch (err) {
                if (err instanceof HttpError) ctx.status = err.status;
                else if (err instanceof FfsError) ctx.status = 400;
                else throw err;
            }
        });

        this.patch('/:path+', async (ctx, next) => {
            try {
                assert(typeof ctx.headers['time'] === 'string', new HttpError(400));
                ctx.state.time = Number.parseInt(ctx.headers['time']);
                assert(Number.isInteger(ctx.state.time), new HttpError(400));
                assert(
                    this.validateBranch(ctx.state.branch, ctx.state.root),
                    new HttpError(409),
                );
                const path = _.dropRight(ctx.state.path);
                const fileName = _.last(ctx.state.path)!;
                const newRootId = ffs.createFile(
                    ctx.state.root,
                    path[Symbol.iterator](),
                    fileName,
                    ctx.is('text/markdown')
                        ? ctx.state.body
                        : [],
                    ctx.state.time,
                );
                ctx.set('Root-File-Id', newRootId.toString());
                ctx.status = 200;
                this.users.setLatestVersion(ctx.state.branch, newRootId);
                await next();
            } catch (err) {
                if (err instanceof HttpError) ctx.status = err.status;
                else if (err instanceof FfsError) ctx.status = 400;
                else throw err;
            }
        });

        this.put('/:path+', async (ctx, next) => {
            try {
                assert(typeof ctx.headers['time'] === 'string', new HttpError(400));
                ctx.state.time = Number.parseInt(ctx.headers['time']);
                assert(Number.isInteger(ctx.state.time), new HttpError(400));
                assert(
                    this.validateBranch(ctx.state.branch, ctx.state.root),
                    new HttpError(409),
                );
                assert(ctx.is('text/markdown'), new HttpError(406));
                const newRootId = ffs.updateFile(
                    ctx.state.root,
                    ctx.state.path[Symbol.iterator](),
                    ctx.state.body,
                    ctx.state.time,
                );
                ctx.set('Root-File-Id', newRootId.toString());
                ctx.status = 200;
                this.users.setLatestVersion(ctx.state.branch, newRootId);
                await next();
            } catch (err) {
                if (err instanceof HttpError) ctx.status = err.status;
                else if (err instanceof FfsError) ctx.status = 400;
                else throw err;
            }
        });

        this.delete('/:path+', async (ctx, next) => {
            try {
                assert(typeof ctx.headers['time'] === 'string', new HttpError(400));
                ctx.state.time = Number.parseInt(ctx.headers['time']);
                assert(Number.isInteger(ctx.state.time), new HttpError(400));
                assert(
                    this.validateBranch(ctx.state.branch, ctx.state.root),
                    new HttpError(409),
                );
                const newRootId = ffs.deleteFile(
                    ctx.state.root,
                    ctx.state.path[Symbol.iterator](),
                    ctx.state.time,
                )!;
                ctx.set('Root-File-Id', newRootId.toString());
                ctx.status = 200;
                this.users.setLatestVersion(ctx.state.branch, newRootId);
                await next();
            } catch (err) {
                if (err instanceof HttpError) ctx.status = err.status;
                else if (err instanceof FfsError) ctx.status = 400;
                else throw err;
            }
        });
    }

    private validateBranch(branchId: number, rootId: FileId): boolean {
        const [branchFirstId, branchLatestId] =
            this.users.getFirstAndLatestVersion(branchId);
        const rootFirstId = this.ffs.getFileMetadata(rootId).firstVersionId;
        assert(branchFirstId === rootFirstId, new HttpError(400));
        return branchLatestId === rootId;
    }
}
