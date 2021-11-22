import KoaRouter = require('@koa/router');
import { FunctionalFileSystem } from '../ffs/ffs';
import { Users } from '../users';
import { FileRouter } from './files'
import { SubscriptionRouter } from './subscriptions';

export class Router extends KoaRouter {
    private fileRouter: FileRouter;
    private subscriptionRouter: SubscriptionRouter;

    constructor(
        ffs: FunctionalFileSystem,
        users: Users,
    ) {
        super();

        this.fileRouter = new FileRouter(ffs, users);
        this.subscriptionRouter = new SubscriptionRouter(users);

        this.use('/files', this.fileRouter.routes());
        this.use('/subscriptions', this.subscriptionRouter.routes());
    }
}
