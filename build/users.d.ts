import Sqlite = require('better-sqlite3');
import { BranchId, UserProfile, SubscriptionsView } from './interfaces';
import { FnodeId } from 'ffs';
export declare class Users {
    private db;
    constructor(db: Sqlite.Database);
    getUserProfileByName(name: string): UserProfile;
    getSubscriptionsView(id: number): SubscriptionsView;
    getLatestVersion(branchId: BranchId): FnodeId;
    setLatestVersion(branchId: BranchId, fileId: FnodeId): void;
}
