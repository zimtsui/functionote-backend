import assert = require('assert');
import {
    RegularFileContent, DirectoryContent, DirectoryContentItem,
    FileContent,
    FileId, PathIterator,
    isRegularFileContent,
} from './interfaces';
import _ = require('lodash');
import { FfsModel } from './model';


export abstract class FfsController extends FfsModel {
    public retrieveFileId(
        rootId: FileId,
        pathIter: PathIterator,
    ): FileId {
        const iterResult = pathIter.next();
        if (iterResult.done) {
            return rootId;
        } else {
            const parentId = rootId;
            const childName = iterResult.value;
            const childId = this.getDirectoryContentItemByName(parentId, childName).id;
            return this.retrieveFileId(childId, pathIter);
        }
    }

    protected createFileFromId(
        rootId: FileId, dirPathIter: PathIterator,
        newFileName: string, newFileId: FileId,
        creationTime: number,
    ): FileId {
        const iterResult = dirPathIter.next();
        if (iterResult.done) {
            const parentId = rootId;

            const parentContent = this.getDirectory(parentId).content;
            const childItem = parentContent.find(child => child.name === newFileName);
            assert(childItem === undefined);

            const newChild: DirectoryContent[0] = {
                id: newFileId, name: newFileName, ctime: creationTime,
            };
            const newParentContent = _(parentContent).push(newChild).value();
            const newParentId = this.makeDirectory(
                creationTime, creationTime, newParentContent, parentId,
            );
            return newParentId;
        } else {
            const parentId = rootId;
            const childName = iterResult.value;

            const parentDirectory = this.getDirectory(parentId);
            const parentContent = parentDirectory.content;
            const childItem = parentContent.find(child => child.name === childName);
            assert(childItem !== undefined);

            const newChild: DirectoryContentItem = {
                id: this.createFileFromId(
                    childItem.id, dirPathIter,
                    newFileName, newFileId,
                    creationTime,
                ),
                name: childItem.name,
                ctime: childItem.ctime
            };
            const newParentContent = _(parentContent)
                .without(childItem)
                .push(newChild)
                .value();
            const newParentId = this.makeDirectory(
                creationTime,
                parentDirectory.mtime,
                newParentContent, parentId,
            );
            return newParentId;
        }
    }

    protected createFile(
        rootId: FileId, dirPathIter: PathIterator,
        fileName: string, content: FileContent,
        creationTime: number,
    ): FileId {
        const fileId = isRegularFileContent(content)
            ? this.makeRegularFile(creationTime, creationTime, content)
            : this.makeDirectory(creationTime, creationTime, content);
        return this.createFileFromId(rootId, dirPathIter,
            fileName, fileId, creationTime,
        );
    }

    protected deleteFile(
        rootId: FileId, pathIter: PathIterator,
        deletionTime: number,
    ): FileId | null {
        const iterResult = pathIter.next();
        if (iterResult.done) {
            return null;
        } else {
            const parentId = rootId;
            const childName = iterResult.value;

            const parentDirectory = this.getDirectory(parentId);
            const parentContent = parentDirectory.content;
            const childItem = parentContent.find(child => child.name === childName);
            assert(childItem !== undefined);

            const newChildId = this.deleteFile(childItem.id, pathIter, deletionTime);
            if (newChildId !== null) {
                const newChildItem: DirectoryContentItem = {
                    id: newChildId,
                    name: childItem.name,
                    ctime: childItem.ctime,
                };
                const newParentContent = _(parentContent)
                    .without(childItem)
                    .push(newChildItem)
                    .value();
                const newParentId = this.makeDirectory(
                    deletionTime, parentDirectory.mtime,
                    newParentContent, parentId,
                );
                return newParentId;
            } else {
                const newParentContent = _(parentContent)
                    .without(childItem)
                    .value();
                const newParentId = this.makeDirectory(
                    deletionTime, deletionTime,
                    newParentContent, parentId,
                );
                return newParentId;
            }
        }
    }

    protected updateFile(
        rootId: FileId, pathIter: PathIterator,
        newFileContent: RegularFileContent,
        updatingTime: number,
    ): FileId {
        const iterResult = pathIter.next();
        if (iterResult.done) {
            const newFileId = this.makeRegularFile(
                updatingTime, updatingTime,
                newFileContent, rootId,
            );
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

            const newChild: DirectoryContentItem = {
                id: this.updateFile(child.id, pathIter, newFileContent, updatingTime),
                name: child.name,
                ctime: child.ctime,
            }
            const newParentContent = _(parentContent)
                .without(child)
                .push(newChild)
                .value();
            const newParentId = this.makeDirectory(
                updatingTime, parentMetadata.mtime,
                newParentContent, parentId,
            );
            return newParentId;
        }
    }
}
