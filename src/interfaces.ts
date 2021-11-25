import { FnodeId } from 'ffs';

export type BranchId = number;
export type UserId = number;
export type PathIterator = Iterator<string>;

export type SubscriptionsView = {
    branchId: number;
    branchName: string;
    latestVersionId: FnodeId;
}[];
