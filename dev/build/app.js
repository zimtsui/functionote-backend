"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const Koa = require("koa");
const __1 = require("../..");
const Cors = require("@koa/cors");
class App extends Koa {
    constructor(db) {
        super();
        this.db = db;
        this.router = new __1.Router(this.db);
        this.use(Cors({
            origin: 'http://localhost:1234',
            exposeHeaders: ['Root-File-Id'],
            credentials: true,
        }));
        this.use(async (ctx, next) => {
            ctx.state.user = 1;
            await next();
        });
        this.use(this.router.routes());
    }
}
exports.App = App;
//# sourceMappingURL=app.js.map