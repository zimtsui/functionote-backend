"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionRouter = void 0;
const KoaRouter = require("@koa/router");
class SubscriptionRouter extends KoaRouter {
    constructor(users) {
        super();
        this.get('/', async (ctx, next) => {
            ctx.body = users.getSubscriptionsView(ctx.state.user);
            await next();
        });
    }
}
exports.SubscriptionRouter = SubscriptionRouter;
//# sourceMappingURL=subscriptions.js.map