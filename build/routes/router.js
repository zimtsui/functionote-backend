"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = void 0;
const KoaRouter = require("@koa/router");
const files_1 = require("./files");
class Router extends KoaRouter {
    constructor(ffs, users) {
        super();
        this.fileRouter = new files_1.FileRouter(ffs, users);
        this.use('/files', this.fileRouter.routes());
    }
}
exports.Router = Router;
//# sourceMappingURL=router.js.map