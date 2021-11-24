import KoaRouter = require('@koa/router');
import { Users } from '../users';


export interface KoaStateAuth {
    user: number;
}

export class SubscriptionRouter extends KoaRouter<KoaStateAuth> {
    constructor(users: Users) {
        super();

        this.get('/', async (ctx, next) => {
            ctx.body = users.getSubscriptionsView(ctx.state.user);
            await next();
        });
    }
}
