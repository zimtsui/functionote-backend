"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRawBody = void 0;
async function getRawBody(stream) {
    const chunks = [];
    for await (const chunk of stream)
        chunks.push(chunk);
    return Buffer.concat(chunks);
}
exports.getRawBody = getRawBody;
//# sourceMappingURL=raw-body.js.map