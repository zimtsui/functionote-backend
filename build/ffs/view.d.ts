import { RegularFileContent, FileView, FileContent, FileId, PathIterator } from './interfaces';
import { FfsController } from './controller';
export declare class FfsView extends FfsController {
    private startTransaction;
    private commitTransaction;
    private rollbackTransaction;
    retrieveFileView(rootId: FileId, pathIter: PathIterator): FileView;
    createFileFromId(rootId: FileId, dirPathIter: PathIterator, fileName: string, newFileId: FileId, creationTime: number): FileId;
    createFile(rootId: FileId, dirPathIter: PathIterator, fileName: string, content: FileContent, creationTime: number): FileId;
    deleteFile(rootId: FileId, pathIter: PathIterator, deletionTime: number): FileId | null;
    updateFile(rootId: FileId, pathIter: PathIterator, newFileContent: RegularFileContent, updatingTime: number): FileId;
}
