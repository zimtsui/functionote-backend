/// <reference types="koa__router" />
import KoaRouter = require('@koa/router');
import { Users } from '../users';
export interface SubscriptionRouterState {
    user: number;
}
export declare class SubscriptionRouter extends KoaRouter<SubscriptionRouterState> {
    constructor(users: Users);
}
