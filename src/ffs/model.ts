import Sqlite = require('better-sqlite3');
import assert = require('assert');
import {
    RegularFileContent, DirectoryContent, DirectoryContentItem,
    Directory, RegularFile,
    DirectoryView, RegularFileView,
    FileMetadata,
    FileType, FileId,
} from './interfaces';
import {
    ErrorFileNotFound,
} from './exceptions';


export abstract class FfsModel {
    constructor(protected db: Sqlite.Database) { }

    protected makeRegularFile(
        rmtime: number,
        mtime: number,
        content: RegularFileContent,
        modifiedFromId?: FileId,
    ): FileId {
        const id = this.makeUniqueFileId();
        this.db.prepare(`
            INSERT INTO files_metadata
            (id, type, rmtime, mtime, previous_version_id, first_version_id)
            VALUES (?, ?, ?, ?, ?, ?)
        ;`).run(
            id,
            '-',
            rmtime,
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
        rmtime: number,
        mtime: number,
        content: DirectoryContent,
        modifiedFromId?: FileId,
    ): FileId {
        const id = this.makeUniqueFileId();
        this.db.prepare(`
            INSERT INTO files_metadata
            (id, type, rmtime, mtime, previous_version_id, first_version_id)
            VALUES (?, ?, ?, ?, ?, ?)
        ;`).run(
            id,
            'd',
            rmtime,
            mtime,
            modifiedFromId !== undefined ? modifiedFromId : null,
            modifiedFromId !== undefined
                ? this.getFileMetadata(modifiedFromId).firstVersionId
                : id,
        );
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

    public getFileMetadata(id: FileId): FileMetadata {
        const row = <{
            id: bigint;
            type: '-' | 'd',
            mtime: bigint,
            rmtime: bigint,
            previousVersionId: bigint,
            firstVersionId: bigint,
        } | undefined>this.db.prepare(`
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
        assert(row, new ErrorFileNotFound());
        return {
            ...row,
            mtime: Number(row.mtime),
            rmtime: Number(row.rmtime),
        };
    }

    public getDirectoryContentItemByName(
        parentId: FileId,
        childName: string,
    ): DirectoryContentItem {
        const row = <{
            childId: bigint;
            btime: bigint;
        } | undefined>this.db.prepare(`
            SELECT
                child_id AS childId,
                btime
            FROM directories_contents
            WHERE parent_id = ? AND child_name = ?
        ;`).safeIntegers(true).get(parentId, childName);
        assert(row, new ErrorFileNotFound());
        return {
            id: row.childId,
            name: childName,
            btime: Number(row.btime),
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
            btime: bigint,
        }[]>this.db.prepare(`
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

    public getDirectory(id: FileId): Directory {
        const fileMetadata = this.getFileMetadata(id);
        assert(fileMetadata.type === 'd', new ErrorFileNotFound());
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
        assert(row, new ErrorFileNotFound());
        return row.content;
    }

    public getRegularFile(id: FileId): RegularFile {
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
        const row = <{
            type: '-';
            mtime: bigint;
            rmtime: bigint;
            previousVersionId: bigint;
            firstVersionId: bigint;
            content: Buffer;
        } | undefined>stmt.get(id);
        assert(row, new ErrorFileNotFound());
        return {
            id,
            ...row,
            mtime: Number(row.mtime),
            rmtime: Number(row.rmtime),
        };
    }

    public getDirectoryViewUnsafe(id: FileId): DirectoryView {
        const rows = <{
            name: string;
            type: FileType;
            rmtime: number;
            btime: number;
        }[]>this.db.prepare(`
            SELECT
                child_name AS name,
                type,
                rmtime,
                btime
            FROM subdirectories, files_metadata
            WHERE parent_id = ? AND child_id = id
        ;`).all(id);
        return rows;
    }

    public getRegularFileView(id: FileId): RegularFileView {
        return this.getRegularFileContent(id);
    }
}
