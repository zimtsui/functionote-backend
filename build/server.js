"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const Koa = require("koa");
const route_1 = require("./route");
const Database = require("better-sqlite3");
const ffs_1 = require("./ffs");
const auth_1 = require("./auth");
class Server extends Koa {
    constructor() {
        super();
        this.db = new Database('./functionote.db', { fileMustExist: true });
        this.ffs = new ffs_1.FunctionalFileSystem(this.db);
        this.router = new route_1.Router(this.ffs);
        this.use((0, auth_1.createPassportMiddleware)(this.ffs));
        this.use(this.router.routes());
    }
}
exports.Server = Server;
//# sourceMappingURL=server.js.map