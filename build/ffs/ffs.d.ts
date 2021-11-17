import Sqlite = require('better-sqlite3');
import { RegularFileContent, DirectoryContent, FileView, FileId, PathIterator } from './interfaces';
export declare class FunctionalFileSystem {
    private db;
    constructor(db: Sqlite.Database);
    private getFileMetadata;
    private getDirectoryContentItemByName;
    private makeUniqueFileId;
    private getFirstVersionId;
    makeRegularFile(rtime: number, mtime: number, content: RegularFileContent, modifiedFromId?: FileId): FileId;
    makeDirectory(rtime: number, mtime: number, content: DirectoryContent, modifiedFromId?: FileId): FileId;
    private getDirectoryContentUnsafe;
    private getDirectory;
    private getRegularFileContent;
    private getRegularFile;
    private getDirectoryViewUnsafe;
    private getRegularFileView;
    retrieveFile(rootId: FileId, pathIter: PathIterator): FileView;
    createFile(rootId: FileId, dirPathIter: PathIterator, newFileId: FileId, newFileName: string, ctime: number): FileId;
    deleteFile(rootId: FileId, pathIter: PathIterator, dtime: number): FileId | null;
    updateFile(rootId: FileId, pathIter: PathIterator, newFileId: FileId, mtime: number): FileId;
}
