export type RegularFileContent = Buffer;
export type DirectoryContent = {
    id: FileId,
    name: string;
    ctime: number;
}[];
export type DirectoryContentDetails = {
    name: string;
    type: FileType;
    ctime: number;
    mtime: number;
}[];

export type FileType = '-' | 'd';
export type FileId = bigint;
export type BranchId = number;
export type UserId = number;
export type PathIterator = Iterator<string>;
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
export type SubscriptionsView = {
    branchId: number;
    branchName: string;
    latestVersionId: FileId;
}[];


export interface AuthState {
    user: number;
}
