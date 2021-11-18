import {
    RegularFileContent,
    FileView,
    FileContent,
    FileId, PathIterator,
} from './interfaces';
import { FunctionalFileSystemKernel } from './kernel';


export class FunctionalFileSystem extends FunctionalFileSystemKernel {
    private startTransaction(): void {
        this.db.prepare(`
            BEGIN TRANSACTION;
        `).run();
    }

    private commitTransaction(): void {
        this.db.prepare(`
            COMMIT;
        `).run();
    }

    private rollbackTransaction(): void {
        this.db.prepare(`
            ROLLBACK;
        `).run();
    }

    public retrieveFileView(
        rootId: FileId,
        pathIter: PathIterator,
    ): FileView {
        const fileId = super.retrieveFileId(rootId, pathIter);
        try {
            const content = super.getRegularFileView(fileId);
            return content;
        } catch (err) {
            const content = super.getDirectoryViewUnsafe(fileId);
            return content;
        }
    }

    public createFileFromId(
        rootId: FileId, dirPathIter: PathIterator,
        fileName: string, newFileId: FileId,
        creationTime: number,
    ): FileId {
        try {
            this.startTransaction();
            const fileId = super.createFileFromId(
                rootId, dirPathIter,
                fileName, newFileId, creationTime,
            );
            this.commitTransaction();
            return fileId;
        } catch (err) {
            this.rollbackTransaction();
            throw err;
        }
    }

    public createFile(
        rootId: FileId, dirPathIter: PathIterator,
        fileName: string, content: FileContent,
        creationTime: number,
    ): FileId {
        try {
            this.startTransaction();
            const fileId = super.createFile(
                rootId, dirPathIter,
                fileName, content, creationTime,
            );
            this.commitTransaction();
            return fileId;
        } catch (err) {
            this.rollbackTransaction();
            throw err;
        }
    }

    public deleteFile(
        rootId: FileId, pathIter: PathIterator,
        deletionTime: number,
    ): FileId | null {
        try {
            this.startTransaction();
            const fileId = super.deleteFile(rootId, pathIter, deletionTime);
            this.commitTransaction();
            return fileId;
        } catch (err) {
            this.rollbackTransaction();
            throw err;
        }
    }

    public updateFile(
        rootId: FileId, pathIter: PathIterator,
        newFileContent: RegularFileContent,
        updatingTime: number,
    ): FileId {
        try {
            this.startTransaction();
            const fileId = super.updateFile(rootId, pathIter, newFileContent, updatingTime);
            this.commitTransaction();
            return fileId;
        } catch (err) {
            this.rollbackTransaction();
            throw err;
        }
    }
}
