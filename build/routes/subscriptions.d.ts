/// <reference types="koa__router" />
import KoaRouter = require('@koa/router');
import { Users } from '../users';
import { AuthState } from '../interfaces';
export declare class SubscriptionRouter extends KoaRouter<AuthState> {
    constructor(users: Users);
}
