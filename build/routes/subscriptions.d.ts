/// <reference types="koa__router" />
import KoaRouter = require('@koa/router');
import { Users } from '../users';
export interface KoaStateAuth {
    user: number;
}
export declare class SubscriptionRouter extends KoaRouter<KoaStateAuth> {
    constructor(users: Users);
}
