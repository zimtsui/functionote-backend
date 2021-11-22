"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FfsModel = void 0;
const assert = require("assert");
const exceptions_1 = require("./exceptions");
class FfsModel {
    constructor(db) {
        this.db = db;
    }
    makeRegularFile(rmtime, mtime, content, modifiedFromId) {
        const id = this.makeUniqueFileId();
        this.db.prepare(`
            INSERT INTO files_metadata
            (id, type, rmtime, mtime, previous_version_id, first_version_id)
            VALUES (?, ?, ?, ?, ?, ?)
        ;`).run(id, '-', rmtime, mtime, modifiedFromId !== undefined ? modifiedFromId : null, modifiedFromId !== undefined
            ? this.getFileMetadata(modifiedFromId).firstVersionId
            : id);
        this.db.prepare(`
            INSERT INTO regular_files_contents
            (id, content)
            VALUES (?, ?)
        ;`).run(id, content);
        return id;
    }
    makeDirectory(rmtime, mtime, content, modifiedFromId) {
        const id = this.makeUniqueFileId();
        this.db.prepare(`
            INSERT INTO files_metadata
            (id, type, rmtime, mtime, previous_version_id, first_version_id)
            VALUES (?, ?, ?, ?, ?, ?)
        ;`).run(id, 'd', rmtime, mtime, modifiedFromId !== undefined ? modifiedFromId : null, modifiedFromId !== undefined
            ? this.getFileMetadata(modifiedFromId).firstVersionId
            : id);
        for (const child of content) {
            const stmt = this.db.prepare(`
                INSERT INTO directories_contents
                (parent_id, child_id, child_name, btime)
                VALUES (?, ?, ?, ?)
            ;`);
            stmt.run(id, child.id, child.name, child.btime);
        }
        return id;
    }
    getFileMetadata(id) {
        const row = this.db.prepare(`
            SELECT
                id,
                type,
                mtime,
                rmtime,
                previous_version_id AS previousVersionId,
                first_version_id AS firstVersionId
            FROM files_metadata
            WHERE id = ?
        ;`).safeIntegers(true).get(id);
        assert(row, new exceptions_1.ErrorFileNotFound());
        return {
            ...row,
            mtime: Number(row.mtime),
            rmtime: Number(row.rmtime),
        };
    }
    getDirectoryContentItemByName(parentId, childName) {
        const row = this.db.prepare(`
            SELECT
                child_id AS childId,
                btime
            FROM directories_contents
            WHERE parent_id = ? AND child_name = ?
        ;`).safeIntegers(true).get(parentId, childName);
        assert(row, new exceptions_1.ErrorFileNotFound());
        return {
            id: row.childId,
            name: childName,
            btime: Number(row.btime),
        };
    }
    makeUniqueFileId() {
        const row = this.db.prepare(`
            SELECT COUNT(*) AS fileCount
            FROM files_metadata
        ;`).safeIntegers(true).get();
        return row.fileCount + 1n;
    }
    getDirectoryContentUnsafe(id) {
        const rows = this.db.prepare(`
            SELECT
                child_id AS childId,
                child_name AS childName,
                btime
            FROM directories_contents
            WHERE parent_id = ?
        ;`).safeIntegers(true).all(id);
        return rows.map(row => ({
            id: row.childId,
            name: row.childName,
            btime: Number(row.btime),
        }));
    }
    getDirectory(id) {
        const fileMetadata = this.getFileMetadata(id);
        assert(fileMetadata.type === 'd', new exceptions_1.ErrorFileNotFound());
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
        assert(row, new exceptions_1.ErrorFileNotFound());
        return row.content;
    }
    getRegularFile(id) {
        const stmt = this.db.prepare(`
            SELECT
                type,
                mtime,
                rmtime,
                previous_version_id AS previousVersionId,
                first_version_id AS firstVersionId,
                content
            FROM files_metadata, regular_files_contents
            WHERE id = ?
        ;`).safeIntegers(true);
        const row = stmt.get(id);
        assert(row, new exceptions_1.ErrorFileNotFound());
        return {
            id,
            ...row,
            mtime: Number(row.mtime),
            rmtime: Number(row.rmtime),
        };
    }
    getDirectoryViewUnsafe(id) {
        const rows = this.db.prepare(`
            SELECT
                child_name AS name,
                type,
                rmtime,
                btime
            FROM directories_contents, files_metadata
            WHERE parent_id = ? AND child_id = id
        ;`).all(id);
        return rows;
    }
    getRegularFileView(id) {
        return this.getRegularFileContent(id);
    }
}
exports.FfsModel = FfsModel;
//# sourceMappingURL=model.js.map