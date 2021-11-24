import KoaRouter = require('@koa/router');
import { FunctionalFileSystem } from 'ffs';
import { Users } from '../users';
import { FileRouter, FileRouterState } from './files';
import { KoaStateAuth, SubscriptionRouter as S10nRouter } from './subscriptions';


type RouterState = KoaStateAuth & FileRouterState;

export class Router extends KoaRouter<RouterState> {
    private fileRouter: FileRouter;
    private s10nRouter: S10nRouter;

    constructor(
        ffs: FunctionalFileSystem,
        users: Users,
    ) {
        super();
        this.fileRouter = new FileRouter(ffs, users);
        this.s10nRouter = new S10nRouter(users);

        this.use('/files', this.fileRouter.routes());
        this.use('/subscriptions', this.s10nRouter.routes());
    }
}
