"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileRouter = void 0;
const KoaRouter = require("@koa/router");
const ffs_1 = require("ffs");
const raw_body_1 = require("../raw-body");
const _ = require("lodash");
const assert = require("assert");
const http_error_1 = require("../http-error");
class FileRouter extends KoaRouter {
    constructor(ffs, users) {
        super();
        this.users = users;
        this.all('/:path*', async (ctx, next) => {
            try {
                ctx.state.branch = Number(ctx.headers['branch-id']);
                assert(Number.isSafeInteger(ctx.state.branch), new http_error_1.HttpError(400));
                ctx.state.root = Number(ctx.headers['root-file-id']);
                assert(Number.isSafeInteger(ctx.state.root), new http_error_1.HttpError(400));
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
                const fileView = ffs.getFileView(ctx.state.root, ctx.state.path[Symbol.iterator]());
                if (fileView instanceof Buffer) {
                    ctx.body = fileView.toString();
                    ctx.type = 'text/markdown';
                }
                else
                    ctx.body = fileView;
                await next();
            }
            catch (err) {
                if (err instanceof http_error_1.HttpError)
                    ctx.status = err.status;
                else if (err instanceof ffs_1.FileNotFound)
                    ctx.status = 404;
                else if (err instanceof ffs_1.FileAlreadyExists)
                    ctx.status = 409;
                else if (err instanceof ffs_1.ExternalError)
                    ctx.status = 400;
                else
                    throw err;
            }
        });
        this.patch('/:path+', async (ctx, next) => {
            try {
                ctx.state.time = Number(ctx.headers['time']);
                assert(Number.isSafeInteger(ctx.state.time), new http_error_1.HttpError(400));
                this.validateBranch(ctx.state.branch, ctx.state.root);
                const path = _.dropRight(ctx.state.path);
                const fileName = _.last(ctx.state.path);
                const newRoot = ctx.is('text/markdown')
                    ? ffs.makeRegularFileByContent(ctx.state.root, path[Symbol.iterator](), fileName, ctx.state.body, ctx.state.time) : ffs.makeEmptyDirectory(ctx.state.root, path[Symbol.iterator](), fileName, ctx.state.time);
                ctx.set('Root-File-Id', newRoot.toString());
                ctx.status = 200;
                this.users.setLatestVersion(ctx.state.branch, newRoot);
                await next();
            }
            catch (err) {
                if (err instanceof http_error_1.HttpError)
                    ctx.status = err.status;
                else if (err instanceof ffs_1.FileNotFound)
                    ctx.status = 404;
                else if (err instanceof ffs_1.FileAlreadyExists)
                    ctx.status = 409;
                else if (err instanceof ffs_1.ExternalError)
                    ctx.status = 400;
                else
                    throw err;
            }
        });
        this.put('/:path+', async (ctx, next) => {
            try {
                ctx.state.time = Number(ctx.headers['time']);
                assert(Number.isSafeInteger(ctx.state.time), new http_error_1.HttpError(400));
                this.validateBranch(ctx.state.branch, ctx.state.root);
                assert(ctx.is('text/markdown'), new http_error_1.HttpError(406));
                const newRoot = ffs.modifyRegularFileContent(ctx.state.root, ctx.state.path[Symbol.iterator](), ctx.state.body, ctx.state.time);
                ctx.set('Root-File-Id', newRoot.toString());
                ctx.status = 200;
                this.users.setLatestVersion(ctx.state.branch, newRoot);
                await next();
            }
            catch (err) {
                if (err instanceof http_error_1.HttpError)
                    ctx.status = err.status;
                else if (err instanceof ffs_1.FileNotFound)
                    ctx.status = 404;
                else if (err instanceof ffs_1.FileAlreadyExists)
                    ctx.status = 409;
                else if (err instanceof ffs_1.ExternalError)
                    ctx.status = 400;
                else
                    throw err;
            }
        });
        this.delete('/:path+', async (ctx, next) => {
            try {
                ctx.state.time = Number(ctx.headers['time']);
                assert(Number.isSafeInteger(ctx.state.time), new http_error_1.HttpError(400));
                this.validateBranch(ctx.state.branch, ctx.state.root);
                const newRoot = ffs.removeFile(ctx.state.root, ctx.state.path[Symbol.iterator](), ctx.state.time);
                ctx.set('Root-File-Id', newRoot.toString());
                ctx.status = 200;
                this.users.setLatestVersion(ctx.state.branch, newRoot);
                await next();
            }
            catch (err) {
                if (err instanceof http_error_1.HttpError)
                    ctx.status = err.status;
                else if (err instanceof ffs_1.FileNotFound)
                    ctx.status = 404;
                else if (err instanceof ffs_1.FileAlreadyExists)
                    ctx.status = 409;
                else if (err instanceof ffs_1.ExternalError)
                    ctx.status = 400;
                else
                    throw err;
            }
        });
    }
    validateBranch(branchId, rootId) {
        const branchLatestId = this.users.getLatestVersion(branchId);
        assert(branchLatestId === rootId, new http_error_1.HttpError(409));
    }
}
exports.FileRouter = FileRouter;
//# sourceMappingURL=files.js.map