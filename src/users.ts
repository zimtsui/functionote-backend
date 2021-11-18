import Sqlite = require('better-sqlite3');
import assert = require('assert');
import {
    DirectoryContentDetails,
    FileType, FileId,
    BranchId,
    UserProfile,
    SubscriptionsView,
} from './interfaces';
import _ = require('lodash');


export class Users {
    constructor(private db: Sqlite.Database) { }

    public getUserProfileByName(name: string): UserProfile {
        const row = <{
            id: number;
            password: string;
        }>this.db.prepare(`
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
        }
    }

    public getSubscriptionsView(id: number): SubscriptionsView {
        const rows = <{
            branchId: bigint;
            branchName: string;
            latestVersionId: bigint;
        }[]>this.db.prepare(`
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

    public getFirstAndLatestVersion(branchId: BranchId): [FileId, FileId] {
        const row = <{
            firstVersionId: bigint;
            latestVersionId: bigint;
        } | undefined>this.db.prepare(`
            SELECT
                first_version_id AS firstVersionId,
                latest_version_id AS latestVersionId
            FROM branches, files_metadata
            WHERE branches.id = ? AND latest_version_id = files_metadata.id
        `).safeIntegers().get(branchId);
        assert(row);
        return [row.firstVersionId, row.latestVersionId];
    }

    public setLatestVersion(branchId: BranchId, fileId: FileId): void {
        this.db.prepare(`
            UPDATE branches
            SET latest_version_id = ?
            WHERE branch_id = ?
        ;`).run(fileId, branchId);
    }
}
