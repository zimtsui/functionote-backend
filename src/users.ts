import Sqlite = require('better-sqlite3');
import assert = require('assert');
import {
    DirectoryContentDetails,
    FileType, FileId,
    BranchId,
    UserProfile,
} from './interfaces';
import _ = require('lodash');


export class Users {
    constructor(private db: Sqlite.Database) { }

    public getUserProfile(name: string): UserProfile {
        const stmt = this.db.prepare(`
            SELECT
                id,
                password
            FROM users
            WHERE name = ?
        ;`);
        const row = <{
            id: number;
            password: string;
        }>stmt.get(name);
        assert(row);
        return {
            id: row.id,
            name,
            password: row.password,
        }
    }

    public getLatestVersion(branchId: BranchId): FileId {
        const stmt = this.db.prepare(`
            SELECT
                latest_version_id AS latestVersionId
            FROM branches
            WHERE id = ?
        ;`).safeIntegers(true);
        const row = <{
            latestVersionId: bigint,
        }>stmt.get(branchId);
        assert(row);
        return row.latestVersionId;
    }

    public setLatestVersion(branchId: BranchId, fileId: FileId): void {
        const stmt = this.db.prepare(`
            UPDATE branches
            SET latest_version_id = ?
            WHERE branch_id = ?
        ;`);
        stmt.run(fileId, branchId);
    }
}
