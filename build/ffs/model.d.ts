import Sqlite = require('better-sqlite3');
import { RegularFileContent, DirectoryContent, DirectoryContentItem, Directory, RegularFile, DirectoryView, RegularFileView, FileMetadata, FileContent, FileId, PathIterator } from './interfaces';
export declare abstract class FfsModel {
    protected db: Sqlite.Database;
    constructor(db: Sqlite.Database);
    abstract retrieveFileId(rootId: FileId, pathIter: PathIterator): FileId;
    protected abstract createFileFromId(rootId: FileId, dirPathIter: PathIterator, newFileName: string, newFileId: FileId, creationTime: number): FileId;
    protected abstract createFile(rootId: FileId, dirPathIter: PathIterator, fileName: string, content: FileContent, creationTime: number): FileId;
    protected abstract deleteFile(rootId: FileId, pathIter: PathIterator, deletionTime: number): FileId | null;
    protected abstract updateFile(rootId: FileId, pathIter: PathIterator, newFileContent: RegularFileContent, updatingTime: number): FileId;
    protected makeRegularFile(rtime: number, mtime: number, content: RegularFileContent, modifiedFromId?: FileId): FileId;
    protected makeDirectory(rtime: number, mtime: number, content: DirectoryContent, modifiedFromId?: FileId): FileId;
    getFileMetadata(id: FileId): FileMetadata;
    getDirectoryContentItemByName(parentId: FileId, childName: string): DirectoryContentItem;
    protected makeUniqueFileId(): FileId;
    getDirectoryContentUnsafe(id: FileId): DirectoryContent;
    getDirectory(id: FileId): Directory;
    getRegularFileContent(id: FileId): RegularFileContent;
    getRegularFile(id: FileId): RegularFile;
    getDirectoryViewUnsafe(id: FileId): DirectoryView;
    getRegularFileView(id: FileId): RegularFileView;
}
