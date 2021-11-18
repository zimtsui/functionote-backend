"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileRouter = exports.ProfileRouter = void 0;
const KoaRouter = require("@koa/router");
const raw_body_1 = require("./raw-body");
const _ = require("lodash");
const assert = require("assert");
const interfaces_1 = require("./ffs/interfaces");
require("./ffs/interfaces");
class ProfileRouter extends KoaRouter {
    constructor(users) {
        super();
        this.get('/branches', async (ctx, next) => {
            try {
                ctx.body = users.getSubscriptionsView(ctx.state.user);
            }
            catch (err) {
                ctx.status = 404;
            }
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
                assert(typeof ctx.headers['branch-id'] === 'string');
                ctx.state.branch = Number.parseInt(ctx.headers['branch-id']);
                assert(Number.isInteger(ctx.state.branch));
                assert(typeof ctx.headers['root-file-id'] === 'string');
                ctx.state.root = BigInt(ctx.headers['root-file-id']);
                assert(typeof ctx.headers['time'] === 'string');
                ctx.state.time = Number.parseInt(ctx.headers['time']);
                assert(Number.isInteger(ctx.state.time));
                ctx.state.body = await (0, raw_body_1.getRawBody)(ctx.req);
                ctx.state.path = ctx.params.path.split('/');
                await next();
            }
            catch (err) {
                ctx.status = 400;
            }
        });
        this.get('/:path*', async (ctx, next) => {
            try {
                try {
                    this.validateBranch(ctx.state.branch, ctx.state.root);
                }
                catch (err) {
                    ctx.status = 400;
                    return;
                }
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
                ctx.status = 404;
            }
        });
        this.patch('/:path+', async (ctx, next) => {
            try {
                try {
                    assert(this.validateBranch(ctx.state.branch, ctx.state.root));
                }
                catch (err) {
                    ctx.status = 400;
                    return;
                }
                const path = _.dropRight(ctx.state.path);
                const fileName = _.last(ctx.state.path);
                const newRootId = ffs.createFile(ctx.state.root, path[Symbol.iterator](), fileName, ctx.is('text/markdown')
                    ? ctx.state.body
                    : [], ctx.state.time);
                ctx.response.set('ROOT-FILE-ID', newRootId.toString());
                await next();
            }
            catch (err) {
                ctx.status = 409;
            }
        });
        this.put('/:path+', async (ctx, next) => {
            try {
                try {
                    assert(this.validateBranch(ctx.state.branch, ctx.state.root));
                }
                catch (err) {
                    ctx.status = 400;
                    return;
                }
                try {
                    assert(ctx.is('text/markdown'));
                }
                catch (err) {
                    ctx.status = 406;
                    return;
                }
                const newRootId = ffs.updateFile(ctx.state.root, ctx.state.path[Symbol.iterator](), ctx.state.body, ctx.state.time);
                ctx.response.set('ROOT-FILE-ID', newRootId.toString());
                await next();
            }
            catch (err) {
                ctx.status = 404;
            }
        });
        this.delete('/:path+', async (ctx, next) => {
            try {
                try {
                    assert(this.validateBranch(ctx.state.branch, ctx.state.root));
                }
                catch (err) {
                    ctx.status = 400;
                    return;
                }
                const newRootId = ffs.deleteFile(ctx.state.root, ctx.state.path[Symbol.iterator](), ctx.state.time);
                ctx.set('ROOT-FILE-ID', newRootId.toString());
                await next();
            }
            catch (err) {
                ctx.status = 404;
            }
        });
    }
    validateBranch(branchId, rootId) {
        const [branchFirstId, branchLatestId] = this.users.getFirstAndLatestVersion(branchId);
        const rootFirstId = this.ffs.getFileMetadata(rootId).firstVersionId;
        assert(branchFirstId === rootFirstId);
        return branchLatestId === rootId;
    }
}
exports.FileRouter = FileRouter;
//# sourceMappingURL=routes.js.map