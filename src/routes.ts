import KoaRouter = require('@koa/router');
import {
    BranchId, FileId,
    RegularFileContent,
} from './interfaces';
import { FunctionalFileSystem } from './ffs/ffs';
import { getRawBody } from './raw-body';
import httpAssert = require('http-assert');
type Assert = httpAssert.AssertOK;


export interface State {
    branch: BranchId;
    root: FileId;
    time: number;
    path: string[];
    body: Buffer;
}


export class Router extends KoaRouter<State> {
    constructor(private ffs: FunctionalFileSystem) {
        super();

        this.all('/:path*', async (ctx, next) => {
            // https://github.com/microsoft/TypeScript/issues/36931
            const assert: Assert = ctx.assert;
            assert(typeof ctx.headers['branch-id'] === 'string', 400);
            assert(typeof ctx.headers['root-file-id'] === 'string', 400);
            assert(typeof ctx.headers['time'] === 'string', 400);
            ctx.state.branch = Number.parseInt(ctx.headers['branch-id']);
            ctx.state.root = BigInt(ctx.headers['root-file-id']);
            ctx.state.time = Number.parseInt(ctx.headers['time']);
            ctx.state.body = await getRawBody(ctx.req);
            ctx.state.path = ctx.params.path.split('/');
            await next();
        });

        this.get('/:path*', async (ctx, next) => {
            try {
                const content = ffs.retrieveFile(
                    ctx.state.root,
                    ctx.state.path[Symbol.iterator](),
                );
                if (content instanceof Buffer) {
                    ctx.body = content.toString();
                    ctx.type = 'text/markdown';
                } else {
                    ctx.body = content;
                }
                await next();
            } catch (err) {
                ctx.status = 404;
            }
        });

        this.patch('/:path+', async (ctx, next) => {
            try {
                const path = <string[]>ctx.state.path;
                const fileName = path.pop()!;
                const fileId = ctx.request.type === 'text/markdown'
                    ? ffs.makeRegularFile(
                        ctx.state.time,
                        ctx.state.time,
                        ctx.state.body,
                    ) : ffs.makeDirectory(
                        ctx.state.time,
                        ctx.state.time,
                        [],
                    );
                const newRootId = ffs.createFile(
                    ctx.state.root,
                    path[Symbol.iterator](),
                    fileId,
                    fileName,
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
                const fileId = ctx.request.type === 'text/markdown'
                    ? ffs.makeRegularFile(
                        ctx.state.time,
                        ctx.state.time,
                        ctx.state.body,
                    ) : ffs.makeDirectory(
                        ctx.state.time,
                        ctx.state.time,
                        [],
                    );
                const newRootId = ffs.updateFile(
                    ctx.state.root,
                    ctx.state.path[Symbol.iterator](),
                    fileId,
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
                const newRootId = ffs.deleteFile(
                    ctx.state.root,
                    ctx.state.path[Symbol.iterator](),
                    ctx.state.time,
                )!;
                ctx.response.set('ROOT-FILE-ID', newRootId.toString());
                await next();
            } catch (err) {
                ctx.status = 404;
            }
        });
    }
}
