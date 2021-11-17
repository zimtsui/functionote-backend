"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const Koa = require("koa");
const routes_1 = require("./routes");
const Database = require("better-sqlite3");
const ffs_1 = require("./ffs/ffs");
const auth_1 = require("./auth");
const users_1 = require("./users");
class Server extends Koa {
    constructor() {
        super();
        this.db = new Database('./functionote.db', { fileMustExist: true });
        this.ffs = new ffs_1.FunctionalFileSystem(this.db);
        this.router = new routes_1.Router(this.ffs);
        this.users = new users_1.Users(this.db);
        this.passportMiddleware = (0, auth_1.createPassportMiddleware)(this.users);
        this.use(this.passportMiddleware);
        this.use(this.router.routes());
    }
}
exports.Server = Server;
//# sourceMappingURL=server.js.map