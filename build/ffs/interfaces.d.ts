/// <reference types="node" />
export declare type FileType = '-' | 'd';
export declare type FileId = bigint;
export declare type PathIterator = Iterator<string>;
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
export declare type FileMetadata = RegularFileMetadata | DirectoryMetadata;
export declare type RegularFileContent = Buffer;
export interface DirectoryContentItem {
    id: FileId;
    name: string;
    btime: number;
}
export declare type DirectoryContent = DirectoryContentItem[];
export declare type FileContent = RegularFileContent | DirectoryContent;
export declare function isRegularFileContent(fileContent: FileContent): fileContent is RegularFileContent;
export interface RegularFile extends RegularFileMetadata {
    content: RegularFileContent;
}
export interface Directory extends DirectoryMetadata {
    content: DirectoryContent;
}
export declare type File = RegularFile | Directory;
export declare type RegularFileView = RegularFileContent;
interface DirectoryContentItemView {
    name: string;
    type: FileType;
    btime: number;
    rmtime: number;
}
export declare type DirectoryView = DirectoryContentItemView[];
export declare type FileView = RegularFileView | DirectoryView;
export declare function isRegularFileContentView(fileContentView: FileView): fileContentView is RegularFileView;
declare global {
    export interface BigInt {
        toJSON(): string;
    }
}
export {};
