/// <reference types="node" />
export declare type RegularFileContent = Buffer;
export declare type DirectoryContent = {
    id: FileId;
    name: string;
    ctime: number;
}[];
export declare type DirectoryContentDetails = {
    name: string;
    type: FileType;
    ctime: number;
    mtime: number;
}[];
export declare type FileType = '-' | 'd';
export declare type FileId = bigint;
export declare type BranchId = number;
export declare type UserId = number;
export declare type PathIterator = Iterator<string>;
export interface FileMetadata {
    type: '-' | 'd';
    mtime: number;
    rtime: number;
    previousVersionId: FileId;
    firstVersionId: FileId;
}
export interface UserProfile {
    id: number;
    name: string;
    password: string;
}
