import { FnodeId } from 'ffs';
export declare type BranchId = number;
export declare type UserId = number;
export declare type PathIterator = Iterator<string>;
export interface UserProfile {
    id: number;
    name: string;
    password: string;
}
export declare type SubscriptionsView = {
    branchId: number;
    branchName: string;
    latestVersionId: FnodeId;
}[];
