"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Users = void 0;
const assert = require("assert");
class Users {
    constructor(db) {
        this.db = db;
    }
    getUserProfileByName(name) {
        const row = this.db.prepare(`
            SELECT
                id,
                password
            FROM users
            WHERE name = ?
        ;`).get(name);
        assert(row);
        return {
            id: row.id,
            name,
            password: row.password,
        };
    }
    getSubscriptionsView(id) {
        const rows = this.db.prepare(`
            SELECT
                branch_id AS branchId,
                branch_name AS branchName,
                latest_version_id AS latestVersionId
            FROM users, subscriptions, branches
            WHERE users.id = ? AND users.id = user_id AND branch_id = branches.id
        ;`).all(id);
        return rows;
    }
    getLatestVersion(branchId) {
        const row = this.db.prepare(`
            SELECT
                latest_version_id AS latestVersionId
            FROM branches
            WHERE branches.id = ?
        `).get(branchId);
        assert(row);
        return row.latestVersionId;
    }
    setLatestVersion(branchId, fileId) {
        this.db.prepare(`
            UPDATE branches
            SET latest_version_id = ?
            WHERE id = ?
        ;`).run(fileId, branchId);
    }
}
exports.Users = Users;
//# sourceMappingURL=users.js.map