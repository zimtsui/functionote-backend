import Sqlite = require('better-sqlite3');
import { FileId, BranchId, UserProfile } from './interfaces';
export declare class Users {
    private db;
    constructor(db: Sqlite.Database);
    getUserProfile(name: string): UserProfile;
    getLatestVersion(branchId: BranchId): FileId;
    setLatestVersion(branchId: BranchId, fileId: FileId): void;
}
