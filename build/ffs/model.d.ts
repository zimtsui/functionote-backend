import Sqlite = require('better-sqlite3');
import { RegularFileContent, DirectoryContent, DirectoryContentItem, Directory, RegularFile, DirectoryView, RegularFileView, FileMetadata, FileId } from './interfaces';
export declare abstract class FfsModel {
    protected db: Sqlite.Database;
    constructor(db: Sqlite.Database);
    protected makeRegularFile(rmtime: number, mtime: number, content: RegularFileContent, modifiedFromId?: FileId): FileId;
    protected makeDirectory(rmtime: number, mtime: number, content: DirectoryContent, modifiedFromId?: FileId): FileId;
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
