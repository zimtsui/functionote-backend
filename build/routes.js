"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileRouter = exports.ProfileRouter = void 0;
const KoaRouter = require("@koa/router");
const ffs_1 = require("./ffs/ffs");
const raw_body_1 = require("./raw-body");
const _ = require("lodash");
const assert = require("assert");
const http_error_1 = require("./http-error");
const interfaces_1 = require("./ffs/interfaces");
require("./ffs/interfaces");
class ProfileRouter extends KoaRouter {
    constructor(users) {
        super();
        this.get('/branches', async (ctx, next) => {
            ctx.body = users.getSubscriptionsView(ctx.state.user);
            await next();
        });
    }
}
exports.ProfileRouter = ProfileRouter;
class FileRouter extends KoaRouter {
    constructor(ffs, users) {
        super();
        this.ffs = ffs;
        this.users = users;
        this.all('/:path*', async (ctx, next) => {
            try {
                assert(typeof ctx.headers['branch-id'] === 'string', new http_error_1.HttpError(400));
                ctx.state.branch = Number.parseInt(ctx.headers['branch-id']);
                assert(Number.isInteger(ctx.state.branch), new http_error_1.HttpError(400));
                assert(typeof ctx.headers['root-file-id'] === 'string', new http_error_1.HttpError(400));
                try {
                    ctx.state.root = BigInt(ctx.headers['root-file-id']);
                }
                catch (err) {
                    throw new http_error_1.HttpError(400);
                }
                ctx.state.body = await (0, raw_body_1.getRawBody)(ctx.req);
                ctx.state.path = ctx.params.path
                    ? ctx.params.path.split('/')
                    : [];
                await next();
            }
            catch (err) {
                if (err instanceof http_error_1.HttpError)
                    ctx.status = err.status;
                else if (err instanceof ffs_1.ExternalError)
                    ctx.status = 400;
                else
                    throw err;
            }
        });
        this.get('/:path*', async (ctx, next) => {
            try {
                this.validateBranch(ctx.state.branch, ctx.state.root);
                const content = ffs.retrieveFileView(ctx.state.root, ctx.state.path[Symbol.iterator]());
                if ((0, interfaces_1.isRegularFileContentView)(content)) {
                    ctx.body = content.toString();
                    ctx.type = 'text/markdown';
                }
                else
                    ctx.body = content;
                await next();
            }
            catch (err) {
                if (err instanceof http_error_1.HttpError)
                    ctx.status = err.status;
                else if (err instanceof ffs_1.ErrorFileNotFound)
                    ctx.status = 404;
                else if (err instanceof ffs_1.ErrorFileAlreadyExists)
                    ctx.status = 409;
                else if (err instanceof ffs_1.ExternalError)
                    ctx.status = 400;
                else
                    throw err;
            }
        });
        this.patch('/:path+', async (ctx, next) => {
            try {
                assert(typeof ctx.headers['time'] === 'string', new http_error_1.HttpError(400));
                ctx.state.time = Number.parseInt(ctx.headers['time']);
                assert(Number.isInteger(ctx.state.time), new http_error_1.HttpError(400));
                assert(this.validateBranch(ctx.state.branch, ctx.state.root), new http_error_1.HttpError(409));
                const path = _.dropRight(ctx.state.path);
                const fileName = _.last(ctx.state.path);
                const newRootId = ffs.createFile(ctx.state.root, path[Symbol.iterator](), fileName, ctx.is('text/markdown')
                    ? ctx.state.body
                    : [], ctx.state.time);
                ctx.set('Root-File-Id', newRootId.toString());
                ctx.status = 200;
                this.users.setLatestVersion(ctx.state.branch, newRootId);
                await next();
            }
            catch (err) {
                if (err instanceof http_error_1.HttpError)
                    ctx.status = err.status;
                else if (err instanceof ffs_1.ErrorFileNotFound)
                    ctx.status = 404;
                else if (err instanceof ffs_1.ErrorFileAlreadyExists)
                    ctx.status = 409;
                else if (err instanceof ffs_1.ExternalError)
                    ctx.status = 400;
                else
                    throw err;
            }
        });
        this.put('/:path+', async (ctx, next) => {
            try {
                assert(typeof ctx.headers['time'] === 'string', new http_error_1.HttpError(400));
                ctx.state.time = Number.parseInt(ctx.headers['time']);
                assert(Number.isInteger(ctx.state.time), new http_error_1.HttpError(400));
                assert(this.validateBranch(ctx.state.branch, ctx.state.root), new http_error_1.HttpError(409));
                assert(ctx.is('text/markdown'), new http_error_1.HttpError(406));
                const newRootId = ffs.updateFile(ctx.state.root, ctx.state.path[Symbol.iterator](), ctx.state.body, ctx.state.time);
                ctx.set('Root-File-Id', newRootId.toString());
                ctx.status = 200;
                this.users.setLatestVersion(ctx.state.branch, newRootId);
                await next();
            }
            catch (err) {
                if (err instanceof http_error_1.HttpError)
                    ctx.status = err.status;
                else if (err instanceof ffs_1.ErrorFileNotFound)
                    ctx.status = 404;
                else if (err instanceof ffs_1.ErrorFileAlreadyExists)
                    ctx.status = 409;
                else if (err instanceof ffs_1.ExternalError)
                    ctx.status = 400;
                else
                    throw err;
            }
        });
        this.delete('/:path+', async (ctx, next) => {
            try {
                assert(typeof ctx.headers['time'] === 'string', new http_error_1.HttpError(400));
                ctx.state.time = Number.parseInt(ctx.headers['time']);
                assert(Number.isInteger(ctx.state.time), new http_error_1.HttpError(400));
                assert(this.validateBranch(ctx.state.branch, ctx.state.root), new http_error_1.HttpError(409));
                const newRootId = ffs.deleteFile(ctx.state.root, ctx.state.path[Symbol.iterator](), ctx.state.time);
                ctx.set('Root-File-Id', newRootId.toString());
                ctx.status = 200;
                this.users.setLatestVersion(ctx.state.branch, newRootId);
                await next();
            }
            catch (err) {
                if (err instanceof http_error_1.HttpError)
                    ctx.status = err.status;
                else if (err instanceof ffs_1.ErrorFileNotFound)
                    ctx.status = 404;
                else if (err instanceof ffs_1.ErrorFileAlreadyExists)
                    ctx.status = 409;
                else if (err instanceof ffs_1.ExternalError)
                    ctx.status = 400;
                else
                    throw err;
            }
        });
    }
    validateBranch(branchId, rootId) {
        const [branchFirstId, branchLatestId] = this.users.getFirstAndLatestVersion(branchId);
        const rootFirstId = this.ffs.getFileMetadata(rootId).firstVersionId;
        assert(branchFirstId === rootFirstId, new http_error_1.HttpError(400));
        return branchLatestId === rootId;
    }
}
exports.FileRouter = FileRouter;
//# sourceMappingURL=routes.js.map