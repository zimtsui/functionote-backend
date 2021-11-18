"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FfsView = void 0;
const controller_1 = require("./controller");
const exceptions_1 = require("./exceptions");
class FfsView {
    constructor(db) {
        this.db = db;
        this.kernel = new controller_1.FfsController(db);
    }
    startTransaction() {
        this.db.prepare(`
            BEGIN TRANSACTION;
        `).run();
    }
    commitTransaction() {
        this.db.prepare(`
            COMMIT;
        `).run();
    }
    rollbackTransaction() {
        this.db.prepare(`
            ROLLBACK;
        `).run();
    }
    retrieveFileView(rootId, pathIter) {
        const fileId = this.kernel.retrieveFileId(rootId, pathIter);
        try {
            const content = this.kernel.getRegularFileView(fileId);
            return content;
        }
        catch (err) {
            if (!(err instanceof exceptions_1.ExternalError))
                throw err;
            const content = this.kernel.getDirectoryViewUnsafe(fileId);
            return content;
        }
    }
    createFileFromId(rootId, dirPathIter, fileName, newFileId, creationTime) {
        try {
            this.startTransaction();
            const fileId = this.kernel.createFileFromId(rootId, dirPathIter, fileName, newFileId, creationTime);
            this.commitTransaction();
            return fileId;
        }
        catch (err) {
            this.rollbackTransaction();
            throw err;
        }
    }
    createFile(rootId, dirPathIter, fileName, content, creationTime) {
        try {
            this.startTransaction();
            const fileId = this.kernel.createFile(rootId, dirPathIter, fileName, content, creationTime);
            this.commitTransaction();
            return fileId;
        }
        catch (err) {
            this.rollbackTransaction();
            throw err;
        }
    }
    deleteFile(rootId, pathIter, deletionTime) {
        try {
            this.startTransaction();
            const fileId = this.kernel.deleteFile(rootId, pathIter, deletionTime);
            this.commitTransaction();
            return fileId;
        }
        catch (err) {
            this.rollbackTransaction();
            throw err;
        }
    }
    updateFile(rootId, pathIter, newFileContent, updatingTime) {
        try {
            this.startTransaction();
            const fileId = this.kernel.updateFile(rootId, pathIter, newFileContent, updatingTime);
            this.commitTransaction();
            return fileId;
        }
        catch (err) {
            this.rollbackTransaction();
            throw err;
        }
    }
    getFileMetadata(id) {
        return this.kernel.getFileMetadata(id);
    }
}
exports.FfsView = FfsView;
//# sourceMappingURL=view.js.map