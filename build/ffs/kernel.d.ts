import Sqlite = require('better-sqlite3');
import { RegularFileContent, DirectoryContent, DirectoryContentItem, Directory, RegularFile, DirectoryView, RegularFileView, FileMetadata, FileContent, FileId, PathIterator } from './interfaces';
export declare class FunctionalFileSystemKernel {
    protected db: Sqlite.Database;
    constructor(db: Sqlite.Database);
    getFileMetadata(id: FileId): FileMetadata;
    getDirectoryContentItemByName(parentId: FileId, childName: string): DirectoryContentItem;
    private makeUniqueFileId;
    private makeRegularFile;
    private makeDirectory;
    getDirectoryContentUnsafe(id: FileId): DirectoryContent;
    getDirectory(id: FileId): Directory;
    getRegularFileContent(id: FileId): RegularFileContent;
    getRegularFile(id: FileId): RegularFile;
    getDirectoryViewUnsafe(id: FileId): DirectoryView;
    getRegularFileView(id: FileId): RegularFileView;
    retrieveFileId(rootId: FileId, pathIter: PathIterator): FileId;
    protected createFileFromId(rootId: FileId, dirPathIter: PathIterator, newFileName: string, newFileId: FileId, creationTime: number): FileId;
    protected createFile(rootId: FileId, dirPathIter: PathIterator, fileName: string, content: FileContent, creationTime: number): FileId;
    protected deleteFile(rootId: FileId, pathIter: PathIterator, deletionTime: number): FileId | null;
    protected updateFile(rootId: FileId, pathIter: PathIterator, newFileContent: RegularFileContent, updatingTime: number): FileId;
}
