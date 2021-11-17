import Sqlite = require('better-sqlite3');
import assert = require('assert');
import {
    RegularFileContent, DirectoryContent, DirectoryContentItem,
    File, Directory, RegularFile,
    FileView, DirectoryView, RegularFileView,
    isRegularFileContentView,
    FileMetadata, DirectoryMetadata, RegularFileMetadata,
    FileType, FileId, PathIterator,
} from './interfaces';
import _ = require('lodash');


export class FunctionalFileSystem {
    constructor(private db: Sqlite.Database) { }

    private getFileMetadata(id: FileId): FileMetadata {
        const row = <{
            id: bigint;
            type: '-' | 'd',
            mtime: bigint,
            rtime: bigint,
            previousVersionId: bigint,
            firstVersionId: bigint,
        } | undefined>this.db.prepare(`
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

    private getDirectoryContentItemByName(
        parentId: FileId,
        childName: string,
    ): DirectoryContentItem {
        const row = <{
            childId: bigint;
            ctime: bigint;
        } | undefined>this.db.prepare(`
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

    private makeUniqueFileId(): FileId {
        const stmt = this.db.prepare(`
            SELECT COUNT(*) AS fileCount
            FROM files_metadata
        ;`).safeIntegers(true);
        const row = <{ fileCount: bigint }>stmt.get();
        return row.fileCount + 1n;
    }

    private getFirstVersionId(id: FileId): FileId {
        const stmt = this.db.prepare(`
            SELECT first_version_id AS firstVersionId
            FROM files_metadata
            WHERE id = ?
        ;`).safeIntegers(true);
        const row = <{ firstVersionId: bigint }>stmt.get(id);
        return row.firstVersionId;
    }

    public makeRegularFile(
        rtime: number,
        mtime: number,
        content: RegularFileContent,
        modifiedFromId?: FileId,
    ): FileId {
        const id = this.makeUniqueFileId();
        const firstVersionId = this.getFirstVersionId(id);
        {
            const stmt = this.db.prepare(`
                INSERT INTO files_metadata
                (id, type, rtime, mtime, previous_version_id, first_version_id)
                VALUES (?, ?, ?, ?, ?, ?)
            ;`);
            stmt.run(
                id,
                '-',
                rtime,
                mtime,
                modifiedFromId !== undefined ? modifiedFromId : null,
                firstVersionId,
            );
        } {
            const stmt = this.db.prepare(`
                INSERT INTO regular_files_contents
                (id, content)
                VALUES (?, ?)
            ;`);
            stmt.run(id, content);
        }
        return id;
    }

    public makeDirectory(
        rtime: number,
        mtime: number,
        content: DirectoryContent,
        modifiedFromId?: FileId,
    ): FileId {
        const id = this.makeUniqueFileId();
        const firstVersionId = this.getFirstVersionId(id);
        {
            const stmt = this.db.prepare(`
                INSERT INTO files_metadata
                (id, type, rtime, mtime, previous_version_id, first_version_id)
                VALUES (?, ?, ?, ?, ?, ?)
            ;`);
            stmt.run(
                id,
                'd',
                rtime,
                mtime,
                modifiedFromId !== undefined ? modifiedFromId : null,
                firstVersionId,
            );
        } {
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

    private getDirectoryContentUnsafe(id: FileId): DirectoryContent {
        const stmt = this.db.prepare(`
            SELECT
                child_id AS childId,
                child_name AS childName,
                ctime
            FROM directories_contents
            WHERE parent_id = ?
        ;`).safeIntegers(true);
        const rows = <{
            childId: bigint,
            childName: string,
            ctime: bigint,
        }[]>stmt.all(id);
        return rows.map(row => ({
            id: row.childId,
            name: row.childName,
            ctime: Number(row.ctime),
        }));
    }

    private getDirectory(id: FileId): Directory {
        const fileMetadata = this.getFileMetadata(id);
        assert(fileMetadata.type === 'd');
        return {
            ...fileMetadata,
            content: this.getDirectoryContentUnsafe(id),
        };
    }

    private getRegularFileContent(id: FileId): RegularFileContent {
        const stmt = this.db.prepare(`
            SELECT content
            FROM regular_files_contents
            WHERE id = ?
        ;`);
        const row = <{ content: Buffer } | undefined>stmt.get(id);
        assert(row);
        return row.content;
    }

    private getRegularFile(id: FileId): RegularFile {
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
        const row = <{
            type: '-';
            mtime: bigint;
            rtime: bigint;
            previousVersionId: bigint;
            firstVersionId: bigint;
            content: Buffer;
        } | undefined>stmt.get(id);
        assert(row);
        return {
            id,
            ...row,
            mtime: Number(row.mtime),
            rtime: Number(row.rtime),
        };
    }

    private getDirectoryViewUnsafe(id: FileId): DirectoryView {
        const rows = <{
            name: string;
            type: FileType;
            mtime: number;
            ctime: number;
        }[]>this.db.prepare(`
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

    private getRegularFileView(id: FileId): RegularFileView {
        return this.getRegularFileContent(id);
    }

    public retrieveFile(
        rootId: FileId,
        pathIter: PathIterator,
    ): FileView {
        const iterResult = pathIter.next();
        if (iterResult.done) {
            const fileId = rootId;
            try {
                return this.getRegularFileView(fileId);
            } catch (err) {
                return this.getDirectoryViewUnsafe(fileId);
            }
        } else {
            const parentId = rootId;
            const childName = iterResult.value;
            const childId = this.getDirectoryContentItemByName(parentId, childName).id;
            return this.retrieveFile(childId, pathIter);
        }
    }

    public createFile(
        rootId: FileId, dirPathIter: PathIterator,
        newFileId: FileId, newFileName: string,
        ctime: number,
    ): FileId {
        const iterResult = dirPathIter.next();
        if (iterResult.done) {
            const parentId = rootId;
            const parentMetadata = this.getFileMetadata(parentId);
            assert(parentMetadata.type === 'd');

            const parentContent = this.getDirectoryContentUnsafe(parentId);
            const child = parentContent.find(
                child => child.name === newFileName
            );
            assert(child === undefined);

            const newChild: DirectoryContent[0] = {
                id: newFileId, name: newFileName, ctime,
            };
            const newParentContent = _(parentContent)
                .push(newChild)
                .value();
            const newParentId = this.makeDirectory(
                ctime, ctime, newParentContent, parentId,
            );
            return newParentId;
        } else {
            const parentId = rootId;
            const childName = iterResult.value;
            const parentMetadata = this.getFileMetadata(parentId);

            const parentContent = this.getDirectoryContentUnsafe(parentId);
            const child = parentContent.find(
                child => child.name === childName
            );
            assert(child !== undefined);

            const newChild: DirectoryContent[0] = {
                id: this.createFile(
                    child.id, dirPathIter,
                    newFileId, newFileName,
                    ctime,
                ),
                name: child.name,
                ctime: child.ctime
            };
            const newParentContent = _(parentContent)
                .without(child)
                .push(newChild)
                .value();
            const newParentId = this.makeDirectory(
                ctime,
                parentMetadata.mtime,
                newParentContent, parentId,
            );
            return newParentId;
        }
    }

    public deleteFile(
        rootId: FileId, pathIter: PathIterator,
        dtime: number,
    ): FileId | null {
        const iterResult = pathIter.next();
        if (iterResult.done) {
            return null;
        } else {
            const parentId = rootId;
            const childName = iterResult.value;
            const parentMetadata = this.getFileMetadata(parentId);

            const parentContent = this.getDirectoryContentUnsafe(parentId);
            const child = parentContent.find(
                child => child.name === childName
            );
            assert(child !== undefined);

            const newChildId = this.deleteFile(child.id, pathIter, dtime);
            if (newChildId !== null) {
                const newChild: DirectoryContent[0] = {
                    id: newChildId,
                    name: child.name,
                    ctime: child.ctime,
                };
                const newParentContent = _(parentContent)
                    .without(child)
                    .push(newChild)
                    .value();
                const newParentId = this.makeDirectory(
                    dtime, parentMetadata.mtime,
                    newParentContent, parentId,
                );
                return newParentId;
            } else {
                const newParentContent = _(parentContent)
                    .without(child)
                    .value();
                const newParentId = this.makeDirectory(
                    dtime, dtime,
                    newParentContent, parentId,
                );
                return newParentId;
            }
        }
    }

    public updateFile(
        rootId: FileId, pathIter: PathIterator,
        newFileId: FileId, mtime: number,
    ): FileId {
        const iterResult = pathIter.next();
        if (iterResult.done) {
            return newFileId;
        } else {
            const parentId = rootId;
            const newChildName = iterResult.value;
            const parentMetadata = this.getFileMetadata(parentId);

            const parentContent = this.getDirectoryContentUnsafe(parentId);
            const child = parentContent.find(
                child => child.name === newChildName
            );
            assert(child !== undefined);

            const newChild: DirectoryContent[0] = {
                id: this.updateFile(child.id, pathIter, newFileId, mtime),
                name: child.name,
                ctime: child.ctime,
            }
            const newParentContent = _(parentContent)
                .without(child)
                .push(newChild)
                .value();
            const newParentId = this.makeDirectory(
                mtime, parentMetadata.mtime,
                newParentContent, parentId,
            );
            return newParentId;
        }
    }
}
