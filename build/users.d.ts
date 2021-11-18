import Sqlite = require('better-sqlite3');
import { FileId, BranchId, UserProfile, SubscriptionsView } from './interfaces';
export declare class Users {
    private db;
    constructor(db: Sqlite.Database);
    getUserProfileByName(name: string): UserProfile;
    getSubscriptionsView(id: number): SubscriptionsView;
    getFirstAndLatestVersion(branchId: BranchId): [FileId, FileId];
    setLatestVersion(branchId: BranchId, fileId: FileId): void;
}
