"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = void 0;
const KoaRouter = require("@koa/router");
const users_1 = require("../users");
const files_1 = require("./files");
const subscriptions_1 = require("./subscriptions");
class Router extends KoaRouter {
    constructor(db, ffs) {
        super();
        const users = new users_1.Users(db);
        this.fileRouter = new files_1.FileRouter(ffs, users);
        this.s10nRouter = new subscriptions_1.SubscriptionRouter(users);
        this.use('/files', this.fileRouter.routes());
        this.use('/subscriptions', this.s10nRouter.routes());
    }
}
exports.Router = Router;
//# sourceMappingURL=router.js.map