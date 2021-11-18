"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunctionalFileSystemKernel = void 0;
const assert = require("assert");
const interfaces_1 = require("./interfaces");
const _ = require("lodash");
class FunctionalFileSystemKernel {
    constructor(db) {
        this.db = db;
    }
    getFileMetadata(id) {
        const row = this.db.prepare(`
            SELECT
                id,
                type,
                mtime,
                rtime,
                previous_version_id AS previousVersionId,
                first_version_id AS firstVersionId,
            FROM files_metadata
            WHERE id = ?
        ;`).safeIntegers(true).get(id);
        assert(row);
        return {
            ...row,
            mtime: Number(row.mtime),
            rtime: Number(row.rtime),
        };
    }
    getDirectoryContentItemByName(parentId, childName) {
        const row = this.db.prepare(`
            SELECT
                child_id AS childId,
                ctime
            FROM directories_contents
            WHERE parent_id = ? AND child_name = ?
        ;`).safeIntegers(true).get(parentId, childName);
        assert(row);
        return {
            id: row.childId,
            name: childName,
            ctime: Number(row.ctime),
        };
    }
    makeUniqueFileId() {
        const row = this.db.prepare(`
            SELECT COUNT(*) AS fileCount
            FROM files_metadata
        ;`).safeIntegers(true).get();
        return row.fileCount + 1n;
    }
    makeRegularFile(rtime, mtime, content, modifiedFromId) {
        const id = this.makeUniqueFileId();
        this.db.prepare(`
            INSERT INTO files_metadata
            (id, type, rtime, mtime, previous_version_id, first_version_id)
            VALUES (?, ?, ?, ?, ?, ?)
        ;`).run(id, '-', rtime, mtime, modifiedFromId !== undefined ? modifiedFromId : null, modifiedFromId !== undefined
            ? this.getFileMetadata(modifiedFromId).firstVersionId
            : id);
        this.db.prepare(`
            INSERT INTO regular_files_contents
            (id, content)
            VALUES (?, ?)
        ;`).run(id, content);
        return id;
    }
    makeDirectory(rtime, mtime, content, modifiedFromId) {
        const id = this.makeUniqueFileId();
        this.db.prepare(`
            INSERT INTO files_metadata
            (id, type, rtime, mtime, previous_version_id, first_version_id)
            VALUES (?, ?, ?, ?, ?, ?)
        ;`).run(id, 'd', rtime, mtime, modifiedFromId !== undefined ? modifiedFromId : null, modifiedFromId !== undefined
            ? this.getFileMetadata(modifiedFromId).firstVersionId
            : id);
        for (const child of content) {
            const stmt = this.db.prepare(`
                INSERT INTO directories_contents
                (parent_id, child_id, child_name, ctime)
                VALUES (?, ?, ?, ?)
            ;`);
            stmt.run(id, child.id, child.name, child.ctime);
        }
        return id;
    }
    getDirectoryContentUnsafe(id) {
        const rows = this.db.prepare(`
            SELECT
                child_id AS childId,
                child_name AS childName,
                ctime
            FROM directories_contents
            WHERE parent_id = ?
        ;`).safeIntegers(true).all(id);
        return rows.map(row => ({
            id: row.childId,
            name: row.childName,
            ctime: Number(row.ctime),
        }));
    }
    getDirectory(id) {
        const fileMetadata = this.getFileMetadata(id);
        assert(fileMetadata.type === 'd');
        return {
            ...fileMetadata,
            content: this.getDirectoryContentUnsafe(id),
        };
    }
    getRegularFileContent(id) {
        const stmt = this.db.prepare(`
            SELECT content
            FROM regular_files_contents
            WHERE id = ?
        ;`);
        const row = stmt.get(id);
        assert(row);
        return row.content;
    }
    getRegularFile(id) {
        const stmt = this.db.prepare(`
            SELECT
                type,
                mtime,
                rtime,
                previous_version_id AS previousVersionId,
                first_version_id AS firstVersionId,
                content
            FROM files_metadata, regular_files_contents
            WHERE id = ?
        ;`).safeIntegers(true);
        const row = stmt.get(id);
        assert(row);
        return {
            id,
            ...row,
            mtime: Number(row.mtime),
            rtime: Number(row.rtime),
        };
    }
    getDirectoryViewUnsafe(id) {
        const rows = this.db.prepare(`
            SELECT
                child_name AS name,
                type,
                mtime,
                ctime
            FROM subdirectories, files_metadata
            WHERE parent_id = ? AND child_id = id
        ;`).all(id);
        return rows;
    }
    getRegularFileView(id) {
        return this.getRegularFileContent(id);
    }
    retrieveFileId(rootId, pathIter) {
        const iterResult = pathIter.next();
        if (iterResult.done) {
            return rootId;
        }
        else {
            const parentId = rootId;
            const childName = iterResult.value;
            const childId = this.getDirectoryContentItemByName(parentId, childName).id;
            return this.retrieveFileId(childId, pathIter);
        }
    }
    createFileFromId(rootId, dirPathIter, newFileName, newFileId, creationTime) {
        const iterResult = dirPathIter.next();
        if (iterResult.done) {
            const parentId = rootId;
            const parentContent = this.getDirectory(parentId).content;
            const childItem = parentContent.find(child => child.name === newFileName);
            assert(childItem === undefined);
            const newChild = {
                id: newFileId, name: newFileName, ctime: creationTime,
            };
            const newParentContent = _(parentContent).push(newChild).value();
            const newParentId = this.makeDirectory(creationTime, creationTime, newParentContent, parentId);
            return newParentId;
        }
        else {
            const parentId = rootId;
            const childName = iterResult.value;
            const parentDirectory = this.getDirectory(parentId);
            const parentContent = parentDirectory.content;
            const childItem = parentContent.find(child => child.name === childName);
            assert(childItem !== undefined);
            const newChild = {
                id: this.createFileFromId(childItem.id, dirPathIter, newFileName, newFileId, creationTime),
                name: childItem.name,
                ctime: childItem.ctime
            };
            const newParentContent = _(parentContent)
                .without(childItem)
                .push(newChild)
                .value();
            const newParentId = this.makeDirectory(creationTime, parentDirectory.mtime, newParentContent, parentId);
            return newParentId;
        }
    }
    createFile(rootId, dirPathIter, fileName, content, creationTime) {
        const fileId = (0, interfaces_1.isRegularFileContent)(content)
            ? this.makeRegularFile(creationTime, creationTime, content)
            : this.makeDirectory(creationTime, creationTime, content);
        return this.createFileFromId(rootId, dirPathIter, fileName, fileId, creationTime);
    }
    deleteFile(rootId, pathIter, deletionTime) {
        const iterResult = pathIter.next();
        if (iterResult.done) {
            return null;
        }
        else {
            const parentId = rootId;
            const childName = iterResult.value;
            const parentDirectory = this.getDirectory(parentId);
            const parentContent = parentDirectory.content;
            const childItem = parentContent.find(child => child.name === childName);
            assert(childItem !== undefined);
            const newChildId = this.deleteFile(childItem.id, pathIter, deletionTime);
            if (newChildId !== null) {
                const newChildItem = {
                    id: newChildId,
                    name: childItem.name,
                    ctime: childItem.ctime,
                };
                const newParentContent = _(parentContent)
                    .without(childItem)
                    .push(newChildItem)
                    .value();
                const newParentId = this.makeDirectory(deletionTime, parentDirectory.mtime, newParentContent, parentId);
                return newParentId;
            }
            else {
                const newParentContent = _(parentContent)
                    .without(childItem)
                    .value();
                const newParentId = this.makeDirectory(deletionTime, deletionTime, newParentContent, parentId);
                return newParentId;
            }
        }
    }
    updateFile(rootId, pathIter, newFileContent, updatingTime) {
        const iterResult = pathIter.next();
        if (iterResult.done) {
            const newFileId = this.makeRegularFile(updatingTime, updatingTime, newFileContent, rootId);
            return newFileId;
        }
        else {
            const parentId = rootId;
            const newChildName = iterResult.value;
            const parentMetadata = this.getFileMetadata(parentId);
            const parentContent = this.getDirectoryContentUnsafe(parentId);
            const child = parentContent.find(child => child.name === newChildName);
            assert(child !== undefined);
            const newChild = {
                id: this.updateFile(child.id, pathIter, newFileContent, updatingTime),
                name: child.name,
                ctime: child.ctime,
            };
            const newParentContent = _(parentContent)
                .without(child)
                .push(newChild)
                .value();
            const newParentId = this.makeDirectory(updatingTime, parentMetadata.mtime, newParentContent, parentId);
            return newParentId;
        }
    }
}
exports.FunctionalFileSystemKernel = FunctionalFileSystemKernel;
//# sourceMappingURL=kernel.js.map