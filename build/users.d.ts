import Sqlite = require('better-sqlite3');
import { BranchId, SubscriptionsView } from './interfaces';
import { FnodeId } from 'ffs';
export declare class Users {
    private db;
    constructor(db: Sqlite.Database);
    getSubscriptionsView(id: number): SubscriptionsView;
    getLatestVersion(branchId: BranchId): FnodeId;
    setLatestVersion(branchId: BranchId, fileId: FnodeId): void;
}
