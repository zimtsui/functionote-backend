import KoaPassport = require('koa-passport');
import { Users } from './users';
export declare class Passport extends KoaPassport.KoaPassport {
    constructor(users: Users);
}
