import Sqlite = require('better-sqlite3');
import { RegularFileContent, DirectoryContent, Directory, RegularFile, DirectoryView, RegularFileView, FileMetadata, FileId, PathIterator } from './interfaces';
export declare class FunctionalFileSystem {
    private db;
    constructor(db: Sqlite.Database);
    getFileMetadata(id: FileId): FileMetadata;
    private getDirectoryContentItemByName;
    private makeUniqueFileId;
    makeRegularFile(rtime: number, mtime: number, content: RegularFileContent, modifiedFromId?: FileId): FileId;
    makeDirectory(rtime: number, mtime: number, content: DirectoryContent, modifiedFromId?: FileId): FileId;
    private getDirectoryContentUnsafe;
    getDirectory(id: FileId): Directory;
    private getRegularFileContent;
    getRegularFile(id: FileId): RegularFile;
    getDirectoryViewUnsafe(id: FileId): DirectoryView;
    getRegularFileView(id: FileId): RegularFileView;
    retrieveFile(rootId: FileId, pathIter: PathIterator): FileId;
    createFile(rootId: FileId, dirPathIter: PathIterator, newFileId: FileId, newFileName: string, creationTime: number): FileId;
    deleteFile(rootId: FileId, pathIter: PathIterator, deletionTime: number): FileId | null;
    updateFile(rootId: FileId, pathIter: PathIterator, newFileId: FileId, updatingTime: number): FileId;
}
