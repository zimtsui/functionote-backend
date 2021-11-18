"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FfsView = void 0;
const controller_1 = require("./controller");
class FfsView extends controller_1.FfsController {
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
        const fileId = super.retrieveFileId(rootId, pathIter);
        try {
            const content = super.getRegularFileView(fileId);
            return content;
        }
        catch (err) {
            const content = super.getDirectoryViewUnsafe(fileId);
            return content;
        }
    }
    createFileFromId(rootId, dirPathIter, fileName, newFileId, creationTime) {
        try {
            this.startTransaction();
            const fileId = super.createFileFromId(rootId, dirPathIter, fileName, newFileId, creationTime);
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
            const fileId = super.createFile(rootId, dirPathIter, fileName, content, creationTime);
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
            const fileId = super.deleteFile(rootId, pathIter, deletionTime);
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
            const fileId = super.updateFile(rootId, pathIter, newFileContent, updatingTime);
            this.commitTransaction();
            return fileId;
        }
        catch (err) {
            this.rollbackTransaction();
            throw err;
        }
    }
}
exports.FfsView = FfsView;
//# sourceMappingURL=view.js.map