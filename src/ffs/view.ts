import {
    RegularFileContent,
    FileView, FileMetadata,
    FileContent,
    FileId, PathIterator,
} from './interfaces';
import { FfsController } from './controller';
import { Database } from 'better-sqlite3';
import {
    ExternalError,
} from './exceptions';


export class FfsView {
    private kernel: FfsController;
    constructor(private db: Database) {
        this.kernel = new FfsController(db);
    }

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
        const fileId = this.kernel.retrieveFileId(rootId, pathIter);
        try {
            const content = this.kernel.getRegularFileView(fileId);
            return content;
        } catch (err) {
            if (!(err instanceof ExternalError)) throw err;
            const content = this.kernel.getDirectoryViewUnsafe(fileId);
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
            const fileId = this.kernel.createFileFromId(
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
            const fileId = this.kernel.createFile(
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
            const fileId = this.kernel.deleteFile(rootId, pathIter, deletionTime);
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
            const fileId = this.kernel.updateFile(rootId, pathIter, newFileContent, updatingTime);
            this.commitTransaction();
            return fileId;
        } catch (err) {
            this.rollbackTransaction();
            throw err;
        }
    }

    public getFileMetadata(id: FileId): FileMetadata {
        return this.kernel.getFileMetadata(id);
    }
}
