import KoaRouter = require('@koa/router');
import {
    BranchId, FileId,
} from './interfaces';
import { FunctionalFileSystem } from './ffs/ffs';
import { getRawBody } from './raw-body';
import _ = require('lodash');
import { Users } from './users';
import assert = require('assert');
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
                assert(typeof ctx.headers['branch-id'] === 'string');
                ctx.state.branch = Number.parseInt(ctx.headers['branch-id']);
                assert(Number.isInteger(ctx.state.branch));

                assert(typeof ctx.headers['root-file-id'] === 'string');
                ctx.state.root = BigInt(ctx.headers['root-file-id']);

                assert(typeof ctx.headers['time'] === 'string');
                ctx.state.time = Number.parseInt(ctx.headers['time']);
                assert(Number.isInteger(ctx.state.time));

                ctx.state.body = await getRawBody(ctx.req);
                ctx.state.path = ctx.params.path.split('/');
                await next();
            } catch (err) {
                ctx.status = 400;
            }
        });

        this.get('/:path*', async (ctx, next) => {
            try {
                try {
                    this.validateBranch(ctx.state.branch, ctx.state.root);
                } catch (err) {
                    ctx.status = 400;
                    return;
                }
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
                ctx.status = 404;
            }
        });

        this.patch('/:path+', async (ctx, next) => {
            try {
                try {
                    assert(this.validateBranch(ctx.state.branch, ctx.state.root));
                } catch (err) {
                    ctx.status = 400;
                    return;
                }
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
                ctx.response.set('ROOT-FILE-ID', newRootId.toString());
                await next();
            } catch (err) {
                ctx.status = 409;
            }
        });

        this.put('/:path+', async (ctx, next) => {
            try {
                try {
                    assert(this.validateBranch(ctx.state.branch, ctx.state.root));
                } catch (err) {
                    ctx.status = 400;
                    return;
                }
                try {
                    assert(ctx.is('text/markdown'));
                } catch (err) {
                    ctx.status = 406;
                    return;
                }
                const newRootId = ffs.updateFile(
                    ctx.state.root,
                    ctx.state.path[Symbol.iterator](),
                    ctx.state.body,
                    ctx.state.time,
                );
                ctx.response.set('ROOT-FILE-ID', newRootId.toString());
                await next();
            } catch (err) {
                ctx.status = 404;
            }
        });

        this.delete('/:path+', async (ctx, next) => {
            try {
                try {
                    assert(this.validateBranch(ctx.state.branch, ctx.state.root));
                } catch (err) {
                    ctx.status = 400;
                    return;
                }
                const newRootId = ffs.deleteFile(
                    ctx.state.root,
                    ctx.state.path[Symbol.iterator](),
                    ctx.state.time,
                )!;
                ctx.set('ROOT-FILE-ID', newRootId.toString());
                await next();
            } catch (err) {
                ctx.status = 404;
            }
        });
    }

    private validateBranch(branchId: number, rootId: FileId): boolean {
        const [branchFirstId, branchLatestId] =
            this.users.getFirstAndLatestVersion(branchId);
        const rootFirstId = this.ffs.getFileMetadata(rootId).firstVersionId;
        assert(branchFirstId === rootFirstId);
        return branchLatestId === rootId;
    }
}
