"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunctionalFileSystem = void 0;
const assert = require("assert");
const _ = require("lodash");
class FunctionalFileSystem {
    constructor(db) {
        this.db = db;
    }
    getUserProfile(name) {
        const stmt = this.db.prepare(`
            SELECT
                id,
                password
            FROM users
            WHERE name = ?
        ;`);
        const row = stmt.get(name);
        assert(row);
        return {
            id: row.id,
            name,
            password: row.password,
        };
    }
    getLatestVersion(branchId) {
        const stmt = this.db.prepare(`
            SELECT
                latest_version_id AS latestVersionId
            FROM branches
            WHERE id = ?
        ;`).safeIntegers(true);
        const row = stmt.get(branchId);
        assert(row);
        return row.latestVersionId;
    }
    setLatestVersion(branchId, fileId) {
        const stmt = this.db.prepare(`
            UPDATE branches
            SET latest_version_id = ?
            WHERE branch_id = ?
        ;`);
        stmt.run(fileId, branchId);
    }
    getFileMetadata(id) {
        const stmt = this.db.prepare(`
            SELECT
                type,
                mtime,
                rtime,
                previous_version_id AS previousVersionId,
                first_version_id AS firstVersionId,
            FROM files_metadata
            WHERE id = ?
        ;`).safeIntegers(true);
        const row = stmt.get(id);
        return {
            type: row.type,
            mtime: Number(row.mtime),
            rtime: Number(row.rtime),
            previousVersionId: row.previousVersionId,
            firstVersionId: row.firstVersionId,
        };
    }
    getChildIdByName(parentId, childName) {
        const stmt = this.db.prepare(`
            SELECT child_id AS childId
            FROM directories_contents
            WHERE parent_id = ? AND child_name = ?
        ;`).safeIntegers(true);
        const row = stmt.get(parentId, childName);
        assert(row);
        return row.childId;
    }
    makeUniqueFileId() {
        const stmt = this.db.prepare(`
            SELECT COUNT(*) AS fileCount
            FROM files_metadata
        ;`).safeIntegers(true);
        const row = stmt.get();
        return row.fileCount + 1n;
    }
    getFirstVersionId(id) {
        const stmt = this.db.prepare(`
            SELECT first_version_id AS firstVersionId
            FROM files_metadata
            WHERE id = ?
        ;`).safeIntegers(true);
        const row = stmt.get(id);
        return row.firstVersionId;
    }
    makeRegularFile(mtime, content, derivedFromId) {
        const id = this.makeUniqueFileId();
        const firstVersionId = this.getFirstVersionId(id);
        {
            const stmt = this.db.prepare(`
                INSERT INTO files_metadata
                (id, type, mtime, previous_version_id, first_version_id)
                VALUES (?, ?, ?, ?, ?)
            ;`);
            stmt.run(id, '-', mtime, derivedFromId !== undefined ? derivedFromId : null, firstVersionId);
        }
        {
            const stmt = this.db.prepare(`
                INSERT INTO regular_files_contents
                (id, content)
                VALUES (?, ?)
            ;`);
            stmt.run(id, content);
        }
        return id;
    }
    makeDirectory(mtime, content, derivedFromId) {
        const id = this.makeUniqueFileId();
        const firstVersionId = this.getFirstVersionId(id);
        {
            const stmt = this.db.prepare(`
                INSERT INTO files_metadata
                (id, type, mtime, previous_version_id, first_version_id)
                VALUES (?, ?, ?, ?, ?)
            ;`);
            stmt.run(id, 'd', mtime, derivedFromId !== undefined ? derivedFromId : null, firstVersionId);
        }
        {
            for (const child of content) {
                const stmt = this.db.prepare(`
                    INSERT INTO directories_contents
                    (parent_id, child_id, child_name, ctime)
                    VALUES (?, ?, ?, ?)
                ;`);
                stmt.run(id, child.id, child.name, child.ctime);
            }
        }
        return id;
    }
    getDirectoryContent(id) {
        const stmt = this.db.prepare(`
            SELECT
                child_id AS childId,
                child_name AS childName,
                ctime
            FROM directories_contents
            WHERE parent_id = ?
        ;`).safeIntegers(true);
        const rows = stmt.all(id);
        return rows.map(row => ({
            id: row.childId,
            name: row.childName,
            ctime: Number(row.ctime),
        }));
    }
    getRegularFileContent(id) {
        const stmt = this.db.prepare(`
            SELECT content
            FROM regular_files_contents
            WHERE id = ?
        ;`);
        const row = stmt.get(id);
        return row.content;
    }
    getDirectoryContentDetails(id) {
        const stmt = this.db.prepare(`
            SELECT
                child_name AS name,
                type,
                files_metadata.mtime AS mtime
                ctime,
            FROM subdirectories, files_metadata
            WHERE id = ? AND parent_id = id
        ;`);
        const rows = stmt.all(id);
        return rows;
    }
    retrieveFile(rootId, pathIter) {
        const iterResult = pathIter.next();
        if (iterResult.done) {
            const fileId = rootId;
            const fileType = this.getFileMetadata(fileId).type;
            if (fileType === '-')
                return this.getRegularFileContent(fileId);
            else
                return this.getDirectoryContentDetails(fileId);
        }
        else {
            const childName = iterResult.value;
            const childId = this.getChildIdByName(rootId, childName);
            return this.retrieveFile(childId, pathIter);
        }
    }
    createFile(rootId, pathIter, newFileId, newFileName, ctime) {
        const iterResult = pathIter.next();
        if (iterResult.done) {
            const parentId = rootId;
            const parentMetadata = this.getFileMetadata(parentId);
            assert(parentMetadata.type === 'd');
            const parentContent = this.getDirectoryContent(parentId);
            const child = parentContent.find(child => child.name === newFileName);
            assert(child === undefined);
            const newChild = {
                id: newFileId, name: newFileName, ctime,
            };
            const newParentContent = _(parentContent)
                .push(newChild)
                .value();
            const newParentId = this.makeDirectory(ctime, newParentContent, parentId);
            return newParentId;
        }
        else {
            const parentId = rootId;
            const childName = iterResult.value;
            const parentMetadata = this.getFileMetadata(parentId);
            const parentContent = this.getDirectoryContent(parentId);
            const child = parentContent.find(child => child.name === childName);
            assert(child !== undefined);
            const newChild = {
                id: this.createFile(child.id, pathIter, newFileId, newFileName, ctime),
                name: child.name,
                ctime: child.ctime
            };
            const newParentContent = _(parentContent)
                .without(child)
                .push(newChild)
                .value();
            const newParentId = this.makeDirectory(parentMetadata.mtime, newParentContent, parentId);
            return newParentId;
        }
    }
    deleteFile(rootId, pathIter, dtime) {
        const iterResult = pathIter.next();
        if (iterResult.done) {
            return null;
        }
        else {
            const parentId = rootId;
            const childName = iterResult.value;
            const parentMetadata = this.getFileMetadata(parentId);
            const parentContent = this.getDirectoryContent(parentId);
            const child = parentContent.find(child => child.name === childName);
            assert(child !== undefined);
            const newChildId = this.deleteFile(child.id, pathIter, dtime);
            if (newChildId !== null) {
                const newChild = {
                    id: newChildId,
                    name: child.name,
                    ctime: child.ctime,
                };
                const newParentContent = _(parentContent)
                    .without(child)
                    .push(newChild)
                    .value();
                const newParentId = this.makeDirectory(parentMetadata.mtime, newParentContent, parentId);
                return newParentId;
            }
            else {
                const newParentContent = _(parentContent)
                    .without(child)
                    .value();
                const newParentId = this.makeDirectory(dtime, newParentContent, parentId);
                return newParentId;
            }
        }
    }
    updateFile(rootId, pathIter, newFileId) {
        const iterResult = pathIter.next();
        if (iterResult.done) {
            return newFileId;
        }
        else {
            const parentId = rootId;
            const newChildName = iterResult.value;
            const parentMetadata = this.getFileMetadata(parentId);
            const parentContent = this.getDirectoryContent(parentId);
            const child = parentContent.find(child => child.name === newChildName);
            assert(child !== undefined);
            const newChild = {
                id: this.updateFile(child.id, pathIter, newFileId),
                name: child.name,
                ctime: child.ctime,
            };
            const newParentContent = _(parentContent)
                .without(child)
                .push(newChild)
                .value();
            const newParentId = this.makeDirectory(parentMetadata.mtime, newParentContent, parentId);
            return newParentId;
        }
    }
}
exports.FunctionalFileSystem = FunctionalFileSystem;
//# sourceMappingURL=ffs.js.map