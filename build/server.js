"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const Koa = require("koa");
const routes_1 = require("./routes");
const Database = require("better-sqlite3");
const ffs_1 = require("./ffs/ffs");
const auth_1 = require("./auth");
const users_1 = require("./users");
class App extends Koa {
    constructor() {
        super();
        this.db = new Database('../functionote.db', { fileMustExist: true });
        this.ffs = new ffs_1.FunctionalFileSystem(this.db);
        this.users = new users_1.Users(this.db);
        this.profileMiddleware = new routes_1.ProfileRouter(this.users).routes();
        this.fileMiddleware = new routes_1.FileRouter(this.ffs, this.users).routes();
        this.passport = new auth_1.Passport(this.users);
        this.use(this.passport.initialize());
        this.use(this.passport.authenticate('basic', { session: false }));
        this.use(async (ctx, next) => {
            if (ctx.headers['branch-id'] !== undefined)
                await this.fileMiddleware(ctx, next);
            else
                await this.profileMiddleware(ctx, next);
        });
    }
}
exports.App = App;
//# sourceMappingURL=server.js.map