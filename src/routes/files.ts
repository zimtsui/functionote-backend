import KoaRouter = require('@koa/router');
import {
    BranchId,
} from '../interfaces';
import { FnodeId } from 'ffs';
import {
    FunctionalFileSystem,
    ExternalError as FfsError,
    FileNotFound as FfsFileNotFound,
    FileAlreadyExists as FfsFileAlreadyExists,
} from 'ffs';
import { getRawBody } from '../raw-body';
import _ = require('lodash');
import { Users } from '../users';
import assert = require('assert');
import { HttpError } from '../http-error';


export interface FileRouterState {
    branch: BranchId;
    root: FnodeId;
    time: number;
    path: string[];
    body: Buffer;
}


export class FileRouter extends KoaRouter<FileRouterState> {
    constructor(
        ffs: FunctionalFileSystem,
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
                const fileView = ffs.getFileView(
                    ctx.state.root,
                    ctx.state.path[Symbol.iterator](),
                );
                if (fileView instanceof Buffer) {
                    ctx.body = fileView.toString();
                    ctx.type = 'text/markdown';
                } else
                    ctx.body = fileView;
                await next();
            } catch (err) {
                if (err instanceof HttpError) ctx.status = err.status;
                else if (err instanceof FfsFileNotFound) ctx.status = 404;
                else if (err instanceof FfsFileAlreadyExists) ctx.status = 409;
                else if (err instanceof FfsError) ctx.status = 400;
                else throw err;
            }
        });

        this.patch('/:path+', async (ctx, next) => {
            try {
                assert(typeof ctx.headers['time'] === 'string', new HttpError(400));
                ctx.state.time = Number.parseInt(ctx.headers['time']);
                assert(Number.isInteger(ctx.state.time), new HttpError(400));
                this.validateBranch(ctx.state.branch, ctx.state.root);
                const path = _.dropRight(ctx.state.path);
                const fileName = _.last(ctx.state.path)!;
                const newRoot = ctx.is('text/markdown')
                    ? ffs.makeRegularFileByContent(
                        ctx.state.root,
                        path[Symbol.iterator](),
                        fileName,
                        ctx.state.body,
                        ctx.state.time,
                    ) : ffs.makeEmptyDirectory(
                        ctx.state.root,
                        path[Symbol.iterator](),
                        fileName,
                        ctx.state.time,
                    );
                ctx.set('Root-File-Id', newRoot.toString());
                ctx.status = 200;
                this.users.setLatestVersion(ctx.state.branch, newRoot);
                await next();
            } catch (err) {
                if (err instanceof HttpError) ctx.status = err.status;
                else if (err instanceof FfsFileNotFound) ctx.status = 404;
                else if (err instanceof FfsFileAlreadyExists) ctx.status = 409;
                else if (err instanceof FfsError) ctx.status = 400;
                else throw err;
            }
        });

        this.put('/:path+', async (ctx, next) => {
            try {
                assert(typeof ctx.headers['time'] === 'string', new HttpError(400));
                ctx.state.time = Number.parseInt(ctx.headers['time']);
                assert(Number.isInteger(ctx.state.time), new HttpError(400));
                this.validateBranch(ctx.state.branch, ctx.state.root);
                assert(ctx.is('text/markdown'), new HttpError(406));
                const newRoot = ffs.modifyRegularFileContent(
                    ctx.state.root,
                    ctx.state.path[Symbol.iterator](),
                    ctx.state.body,
                    ctx.state.time,
                );
                ctx.set('Root-File-Id', newRoot.toString());
                ctx.status = 200;
                this.users.setLatestVersion(ctx.state.branch, newRoot);
                await next();
            } catch (err) {
                if (err instanceof HttpError) ctx.status = err.status;
                else if (err instanceof FfsFileNotFound) ctx.status = 404;
                else if (err instanceof FfsFileAlreadyExists) ctx.status = 409;
                else if (err instanceof FfsError) ctx.status = 400;
                else throw err;
            }
        });

        this.delete('/:path+', async (ctx, next) => {
            try {
                assert(typeof ctx.headers['time'] === 'string', new HttpError(400));
                ctx.state.time = Number.parseInt(ctx.headers['time']);
                assert(Number.isInteger(ctx.state.time), new HttpError(400));
                this.validateBranch(ctx.state.branch, ctx.state.root);
                const newRoot = ffs.removeFile(
                    ctx.state.root,
                    ctx.state.path[Symbol.iterator](),
                    ctx.state.time,
                )!;
                ctx.set('Root-File-Id', newRoot.toString());
                ctx.status = 200;
                this.users.setLatestVersion(ctx.state.branch, newRoot);
                await next();
            } catch (err) {
                if (err instanceof HttpError) ctx.status = err.status;
                else if (err instanceof FfsFileNotFound) ctx.status = 404;
                else if (err instanceof FfsFileAlreadyExists) ctx.status = 409;
                else if (err instanceof FfsError) ctx.status = 400;
                else throw err;
            }
        });
    }

    private validateBranch(branchId: number, rootId: FnodeId): void {
        const branchLatestId = this.users.getLatestVersion(branchId);
        assert(branchLatestId === rootId, new HttpError(409));
    }
}
