"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const Database = require("better-sqlite3");
const db = new Database('./functionote.db', { fileMustExist: true });
const app = new app_1.App(db);
app.listen('3000');
//# sourceMappingURL=server.js.map