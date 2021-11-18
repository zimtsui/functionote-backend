"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorFileAlreadyExists = exports.ErrorFileNotFound = exports.ExternalError = void 0;
class ExternalError extends Error {
}
exports.ExternalError = ExternalError;
class ErrorFileNotFound extends ExternalError {
}
exports.ErrorFileNotFound = ErrorFileNotFound;
class ErrorFileAlreadyExists extends ExternalError {
}
exports.ErrorFileAlreadyExists = ErrorFileAlreadyExists;
//# sourceMappingURL=exceptions.js.map