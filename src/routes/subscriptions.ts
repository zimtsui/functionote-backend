import KoaRouter = require('@koa/router');
import { Users } from '../users';
import { AuthState } from '../interfaces';


export class SubscriptionRouter extends KoaRouter<AuthState> {
    constructor(users: Users) {
        super();

        this.get('/', async (ctx, next) => {
            ctx.body = users.getSubscriptionsView(ctx.state.user);
            await next();
        });
    }
}
