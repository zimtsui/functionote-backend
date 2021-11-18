"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalError = exports.isRegularFileContentView = exports.isRegularFileContent = void 0;
function isRegularFileContent(fileContent) {
    return fileContent instanceof Buffer;
}
exports.isRegularFileContent = isRegularFileContent;
function isRegularFileContentView(fileContentView) {
    return fileContentView instanceof Buffer;
}
exports.isRegularFileContentView = isRegularFileContentView;
BigInt.prototype.toJSON = function () { return this.toString(); };
// Error
class ExternalError extends Error {
}
exports.ExternalError = ExternalError;
//# sourceMappingURL=interfaces.js.map