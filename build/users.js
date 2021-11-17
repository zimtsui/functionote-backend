"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Users = void 0;
const assert = require("assert");
class Users {
    constructor(db) {
        this.db = db;
    }
    getUserProfile(name) {
        const stmt = this.db.prepare(`
            SELECT
                id,
                password
            FROM users
            WHERE name = ?
        ;`);
        const row = stmt.get(name);
        assert(row);
        return {
            id: row.id,
            name,
            password: row.password,
        };
    }
    getLatestVersion(branchId) {
        const stmt = this.db.prepare(`
            SELECT
                latest_version_id AS latestVersionId
            FROM branches
            WHERE id = ?
        ;`).safeIntegers(true);
        const row = stmt.get(branchId);
        assert(row);
        return row.latestVersionId;
    }
    setLatestVersion(branchId, fileId) {
        const stmt = this.db.prepare(`
            UPDATE branches
            SET latest_version_id = ?
            WHERE branch_id = ?
        ;`);
        stmt.run(fileId, branchId);
    }
}
exports.Users = Users;
//# sourceMappingURL=users.js.map