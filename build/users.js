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
        ;`).safeIntegers().all(id);
        return rows.map(row => ({
            branchId: Number(row.branchId),
            branchName: row.branchName,
            latestVersionId: row.latestVersionId,
        }));
    }
    getFirstAndLatestVersion(branchId) {
        const row = this.db.prepare(`
            SELECT
                first_version_id AS firstVersionId,
                latest_version_id AS latestVersionId
            FROM branches, files_metadata
            WHERE branches.id = ? AND latest_version_id = files_metadata.id
        `).safeIntegers().get(branchId);
        assert(row);
        return [row.firstVersionId, row.latestVersionId];
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