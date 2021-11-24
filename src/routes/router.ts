import KoaRouter = require('@koa/router');
import { FunctionalFileSystem } from 'ffs';
import { Users } from '../users';
import { FileRouter, FileRouterState } from './files'


type RouterState = KoaStateAuth & FileRouterState;
interface KoaStateAuth {
    user: number;
}


export class Router extends KoaRouter<RouterState> {
    private fileRouter: FileRouter;

    constructor(
        ffs: FunctionalFileSystem,
        users: Users,
    ) {
        super();
        this.fileRouter = new FileRouter(ffs, users);

        this.use('/files', this.fileRouter.routes());
    }
}
