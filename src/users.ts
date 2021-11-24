import Sqlite = require('better-sqlite3');
import assert = require('assert');
import {
    BranchId,
    UserProfile,
    SubscriptionsView,
} from './interfaces';
import { FnodeId } from 'ffs';


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
            branchId: number;
            branchName: string;
            latestVersionId: number;
        }[]>this.db.prepare(`
            SELECT
                branch_id AS branchId,
                branch_name AS branchName,
                latest_version_id AS latestVersionId
            FROM users, subscriptions, branches
            WHERE users.id = ? AND users.id = user_id AND branch_id = branches.id
        ;`).all(id);
        return rows;
    }

    public getLatestVersion(branchId: BranchId): FnodeId {
        const row = <{
            latestVersionId: number;
        } | undefined>this.db.prepare(`
            SELECT
                latest_version_id AS latestVersionId
            FROM branches
            WHERE branches.id = ?
        `).get(branchId);
        assert(row);
        return row.latestVersionId;
    }

    public setLatestVersion(branchId: BranchId, fileId: FnodeId): void {
        this.db.prepare(`
            UPDATE branches
            SET latest_version_id = ?
            WHERE id = ?
        ;`).run(fileId, branchId);
    }
}
