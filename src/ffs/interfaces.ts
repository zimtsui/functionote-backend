// Basic
export type FileType = '-' | 'd';
export type FileId = bigint;
export type PathIterator = Iterator<string>;


// Metadata
interface FileGenericMetadata {
    id: FileId;
    mtime: number;
    rmtime: number;
    previousVersionId: FileId;
    firstVersionId: FileId;
}
export interface RegularFileMetadata extends FileGenericMetadata {
    type: '-';
}
export interface DirectoryMetadata extends FileGenericMetadata {
    type: 'd';
}
export type FileMetadata = RegularFileMetadata | DirectoryMetadata;


// Content
export type RegularFileContent = Buffer;
export interface DirectoryContentItem {
    id: FileId,
    name: string;
    btime: number;
}
export type DirectoryContent = DirectoryContentItem[];
export type FileContent = RegularFileContent | DirectoryContent;
export function isRegularFileContent(fileContent: FileContent)
    : fileContent is RegularFileContent {
    return fileContent instanceof Buffer;
}


// File
export interface RegularFile extends RegularFileMetadata {
    content: RegularFileContent;
}
export interface Directory extends DirectoryMetadata {
    content: DirectoryContent;
}
export type File = RegularFile | Directory;


// View
export type RegularFileView = RegularFileContent;
interface DirectoryContentItemView {
    name: string;
    type: FileType;
    btime: number;
    rmtime: number;
}
export type DirectoryView = DirectoryContentItemView[];
export type FileView = RegularFileView | DirectoryView;
export function isRegularFileContentView(fileContentView: FileView)
    : fileContentView is RegularFileView {
    return fileContentView instanceof Buffer;
}


// bigint
declare global {
    export interface BigInt {
        toJSON(): string;
    }
}
BigInt.prototype.toJSON = function () { return this.toString() }
