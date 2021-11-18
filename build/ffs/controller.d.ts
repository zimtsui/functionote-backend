import { RegularFileContent, FileContent, FileId, PathIterator } from './interfaces';
import { FfsModel } from './model';
export declare class FfsController extends FfsModel {
    retrieveFileId(rootId: FileId, pathIter: PathIterator): FileId;
    createFileFromId(rootId: FileId, dirPathIter: PathIterator, newFileName: string, newFileId: FileId, creationTime: number): FileId;
    createFile(rootId: FileId, dirPathIter: PathIterator, fileName: string, content: FileContent, creationTime: number): FileId;
    deleteFile(rootId: FileId, pathIter: PathIterator, deletionTime: number): FileId | null;
    updateFile(rootId: FileId, pathIter: PathIterator, newFileContent: RegularFileContent, updatingTime: number): FileId;
}
