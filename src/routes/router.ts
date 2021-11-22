import KoaRouter = require('@koa/router');
import {
    BranchId, FileId,
} from '../interfaces';
import {
    FunctionalFileSystem,
    ExternalError as FfsError,
    ErrorFileNotFound,
    ErrorFileAlreadyExists,
} from '../ffs/ffs';
import { getRawBody } from '../raw-body';
import _ = require('lodash');
import { Users } from '../users';
import assert = require('assert');
import { HttpError } from '../http-error';
import {
    isRegularFileContentView,
} from '../ffs/interfaces';
import { FileRouter, FileRouterState } from './files'
import { SubscriptionRouter, SubscriptionRouterState } from './subscriptions';

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
