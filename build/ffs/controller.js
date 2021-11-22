"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FfsController = void 0;
const assert = require("assert");
const interfaces_1 = require("./interfaces");
const _ = require("lodash");
const model_1 = require("./model");
const exceptions_1 = require("./exceptions");
class FfsController extends model_1.FfsModel {
    retrieveFileId(rootId, pathIter) {
        const iterResult = pathIter.next();
        if (iterResult.done) {
            return rootId;
        }
        else {
            const parentId = rootId;
            const childName = iterResult.value;
            const childId = this.getDirectoryContentItemByName(parentId, childName).id;
            return this.retrieveFileId(childId, pathIter);
        }
    }
    createFileFromId(rootId, dirPathIter, newFileName, newFileId, creationTime) {
        const iterResult = dirPathIter.next();
        if (iterResult.done) {
            const parentId = rootId;
            const parentContent = this.getDirectory(parentId).content;
            const childItem = parentContent.find(child => child.name === newFileName);
            assert(childItem === undefined, new exceptions_1.ErrorFileAlreadyExists());
            const newChild = {
                id: newFileId, name: newFileName, btime: creationTime,
            };
            const newParentContent = _(parentContent).push(newChild).value();
            const newParentId = this.makeDirectory(creationTime, creationTime, newParentContent, parentId);
            return newParentId;
        }
        else {
            const parentId = rootId;
            const childName = iterResult.value;
            const parentDirectory = this.getDirectory(parentId);
            const parentContent = parentDirectory.content;
            const childItem = parentContent.find(child => child.name === childName);
            assert(childItem !== undefined, new exceptions_1.ErrorFileNotFound());
            const newChild = {
                id: this.createFileFromId(childItem.id, dirPathIter, newFileName, newFileId, creationTime),
                name: childItem.name,
                btime: childItem.btime
            };
            const newParentContent = _(parentContent)
                .without(childItem)
                .push(newChild)
                .value();
            const newParentId = this.makeDirectory(creationTime, parentDirectory.mtime, newParentContent, parentId);
            return newParentId;
        }
    }
    createFile(rootId, dirPathIter, fileName, content, creationTime) {
        const fileId = (0, interfaces_1.isRegularFileContent)(content)
            ? this.makeRegularFile(creationTime, creationTime, content)
            : this.makeDirectory(creationTime, creationTime, content);
        return this.createFileFromId(rootId, dirPathIter, fileName, fileId, creationTime);
    }
    deleteFile(rootId, pathIter, deletionTime) {
        const iterResult = pathIter.next();
        if (iterResult.done) {
            return null;
        }
        else {
            const parentId = rootId;
            const childName = iterResult.value;
            const parentDirectory = this.getDirectory(parentId);
            const parentContent = parentDirectory.content;
            const childItem = parentContent.find(child => child.name === childName);
            assert(childItem !== undefined, new exceptions_1.ErrorFileNotFound());
            const newChildId = this.deleteFile(childItem.id, pathIter, deletionTime);
            if (newChildId !== null) {
                const newChildItem = {
                    id: newChildId,
                    name: childItem.name,
                    btime: childItem.btime,
                };
                const newParentContent = _(parentContent)
                    .without(childItem)
                    .push(newChildItem)
                    .value();
                const newParentId = this.makeDirectory(deletionTime, parentDirectory.mtime, newParentContent, parentId);
                return newParentId;
            }
            else {
                const newParentContent = _(parentContent)
                    .without(childItem)
                    .value();
                const newParentId = this.makeDirectory(deletionTime, deletionTime, newParentContent, parentId);
                return newParentId;
            }
        }
    }
    updateFile(rootId, pathIter, newFileContent, updatingTime) {
        const iterResult = pathIter.next();
        if (iterResult.done) {
            const newFileId = this.makeRegularFile(updatingTime, updatingTime, newFileContent, rootId);
            return newFileId;
        }
        else {
            const parentId = rootId;
            const newChildName = iterResult.value;
            const parentMetadata = this.getFileMetadata(parentId);
            const parentContent = this.getDirectoryContentUnsafe(parentId);
            const child = parentContent.find(child => child.name === newChildName);
            assert(child !== undefined, new exceptions_1.ErrorFileNotFound());
            const newChild = {
                id: this.updateFile(child.id, pathIter, newFileContent, updatingTime),
                name: child.name,
                btime: child.btime,
            };
            const newParentContent = _(parentContent)
                .without(child)
                .push(newChild)
                .value();
            const newParentId = this.makeDirectory(updatingTime, parentMetadata.mtime, newParentContent, parentId);
            return newParentId;
        }
    }
}
exports.FfsController = FfsController;
//# sourceMappingURL=controller.js.map