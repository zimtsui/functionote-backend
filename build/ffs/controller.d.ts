import { RegularFileContent, FileContent, FileId, PathIterator } from './interfaces';
import { FfsModel } from './model';
export declare abstract class FfsController extends FfsModel {
    retrieveFileId(rootId: FileId, pathIter: PathIterator): FileId;
    protected createFileFromId(rootId: FileId, dirPathIter: PathIterator, newFileName: string, newFileId: FileId, creationTime: number): FileId;
    protected createFile(rootId: FileId, dirPathIter: PathIterator, fileName: string, content: FileContent, creationTime: number): FileId;
    protected deleteFile(rootId: FileId, pathIter: PathIterator, deletionTime: number): FileId | null;
    protected updateFile(rootId: FileId, pathIter: PathIterator, newFileContent: RegularFileContent, updatingTime: number): FileId;
}
