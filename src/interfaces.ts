import { FnodeId } from 'ffs';

export type BranchId = number;
export type UserId = number;
export type PathIterator = Iterator<string>;

export interface UserProfile {
    id: number;
    name: string;
    password: string;
}
export type SubscriptionsView = {
    branchId: number;
    branchName: string;
    latestVersionId: FnodeId;
}[];
