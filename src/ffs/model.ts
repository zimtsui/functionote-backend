import Sqlite = require('better-sqlite3');
import assert = require('assert');
import {
    RegularFileContent, DirectoryContent, DirectoryContentItem,
    Directory, RegularFile,
    DirectoryView, RegularFileView,
    FileMetadata, FileContent,
    FileType, FileId, PathIterator,
} from './interfaces';


export abstract class FfsModel {
    constructor(protected db: Sqlite.Database) { }

    public abstract retrieveFileId(
        rootId: FileId,
        pathIter: PathIterator,
    ): FileId;
    protected abstract createFileFromId(
        rootId: FileId, dirPathIter: PathIterator,
        newFileName: string, newFileId: FileId,
        creationTime: number,
    ): FileId;
    protected abstract createFile(
        rootId: FileId, dirPathIter: PathIterator,
        fileName: string, content: FileContent,
        creationTime: number,
    ): FileId;
    protected abstract deleteFile(
        rootId: FileId, pathIter: PathIterator,
        deletionTime: number,
    ): FileId | null;
    protected abstract updateFile(
        rootId: FileId, pathIter: PathIterator,
        newFileContent: RegularFileContent,
        updatingTime: number,
    ): FileId;


    protected makeRegularFile(
        rtime: number,
        mtime: number,
        content: RegularFileContent,
        modifiedFromId?: FileId,
    ): FileId {
        const id = this.makeUniqueFileId();
        this.db.prepare(`
            INSERT INTO files_metadata
            (id, type, rtime, mtime, previous_version_id, first_version_id)
            VALUES (?, ?, ?, ?, ?, ?)
        ;`).run(
            id,
            '-',
            rtime,
            mtime,
            modifiedFromId !== undefined ? modifiedFromId : null,
            modifiedFromId !== undefined
                ? this.getFileMetadata(modifiedFromId).firstVersionId
                : id,
        );
        this.db.prepare(`
            INSERT INTO regular_files_contents
            (id, content)
            VALUES (?, ?)
        ;`).run(id, content);
        return id;
    }

    protected makeDirectory(
        rtime: number,
        mtime: number,
        content: DirectoryContent,
        modifiedFromId?: FileId,
    ): FileId {
        const id = this.makeUniqueFileId();
        this.db.prepare(`
            INSERT INTO files_metadata
            (id, type, rtime, mtime, previous_version_id, first_version_id)
            VALUES (?, ?, ?, ?, ?, ?)
        ;`).run(
            id,
            'd',
            rtime,
            mtime,
            modifiedFromId !== undefined ? modifiedFromId : null,
            modifiedFromId !== undefined
                ? this.getFileMetadata(modifiedFromId).firstVersionId
                : id,
        );
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

    public getFileMetadata(id: FileId): FileMetadata {
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

    public getDirectoryContentItemByName(
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

    protected makeUniqueFileId(): FileId {
        const row = <{ fileCount: bigint }>this.db.prepare(`
            SELECT COUNT(*) AS fileCount
            FROM files_metadata
        ;`).safeIntegers(true).get();
        return row.fileCount + 1n;
    }

    public getDirectoryContentUnsafe(id: FileId): DirectoryContent {
        const rows = <{
            childId: bigint,
            childName: string,
            ctime: bigint,
        }[]>this.db.prepare(`
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

    public getDirectory(id: FileId): Directory {
        const fileMetadata = this.getFileMetadata(id);
        assert(fileMetadata.type === 'd');
        return {
            ...fileMetadata,
            content: this.getDirectoryContentUnsafe(id),
        };
    }

    public getRegularFileContent(id: FileId): RegularFileContent {
        const stmt = this.db.prepare(`
            SELECT content
            FROM regular_files_contents
            WHERE id = ?
        ;`);
        const row = <{ content: Buffer } | undefined>stmt.get(id);
        assert(row);
        return row.content;
    }

    public getRegularFile(id: FileId): RegularFile {
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

    public getDirectoryViewUnsafe(id: FileId): DirectoryView {
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

    public getRegularFileView(id: FileId): RegularFileView {
        return this.getRegularFileContent(id);
    }
}
