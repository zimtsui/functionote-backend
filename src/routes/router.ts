import KoaRouter = require('@koa/router');
import { FunctionalFileSystem } from '../ffs/ffs';
import { Users } from '../users';
import { FileRouter, FileRouterState } from './files'
import { SubscriptionRouter } from './subscriptions';
import { AuthState } from '../interfaces';


type RouterState = AuthState & FileRouterState;
export class Router extends KoaRouter<RouterState> {
    private fileRouter: FileRouter;
    private subscriptionRouter: SubscriptionRouter;

    constructor(
        ffs: FunctionalFileSystem,
        users: Users,
    ) {
        super();
        this.fileRouter = new FileRouter(ffs, users);
        this.subscriptionRouter = new SubscriptionRouter(users);

        this.use('/subscriptions', this.subscriptionRouter.routes());
        this.use('/files', this.fileRouter.routes());
    }
}
