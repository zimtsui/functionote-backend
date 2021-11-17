import Sqlite = require('better-sqlite3');
import { RegularFileContent, DirectoryContent, DirectoryContentDetails, FileId, PathIterator, BranchId, UserProfile } from './interfaces';
export declare class FunctionalFileSystem {
    private db;
    constructor(db: Sqlite.Database);
    getUserProfile(name: string): UserProfile;
    getLatestVersion(branchId: BranchId): FileId;
    setLatestVersion(branchId: BranchId, fileId: FileId): void;
    private getFileMetadata;
    private getChildIdByName;
    private makeUniqueFileId;
    private getFirstVersionId;
    makeRegularFile(mtime: number, content: RegularFileContent, derivedFromId?: FileId): FileId;
    makeDirectory(mtime: number, content: DirectoryContent, derivedFromId?: FileId): FileId;
    private getDirectoryContent;
    private getRegularFileContent;
    private getDirectoryContentDetails;
    retrieveFile(rootId: FileId, pathIter: PathIterator): RegularFileContent | DirectoryContentDetails;
    createFile(rootId: FileId, pathIter: PathIterator, newFileId: FileId, newFileName: string, ctime: number): FileId;
    deleteFile(rootId: FileId, pathIter: PathIterator, dtime: number): FileId | null;
    updateFile(rootId: FileId, pathIter: PathIterator, newFileId: FileId): FileId;
}
