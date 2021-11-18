import { RegularFileContent, FileView, FileMetadata, FileContent, FileId, PathIterator } from './interfaces';
import { Database } from 'better-sqlite3';
export declare class FfsView {
    private db;
    private kernel;
    constructor(db: Database);
    private startTransaction;
    private commitTransaction;
    private rollbackTransaction;
    retrieveFileView(rootId: FileId, pathIter: PathIterator): FileView;
    createFileFromId(rootId: FileId, dirPathIter: PathIterator, fileName: string, newFileId: FileId, creationTime: number): FileId;
    createFile(rootId: FileId, dirPathIter: PathIterator, fileName: string, content: FileContent, creationTime: number): FileId;
    deleteFile(rootId: FileId, pathIter: PathIterator, deletionTime: number): FileId | null;
    updateFile(rootId: FileId, pathIter: PathIterator, newFileContent: RegularFileContent, updatingTime: number): FileId;
    getFileMetadata(id: FileId): FileMetadata;
}
