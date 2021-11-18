export class HttpError extends Error {
    constructor(public status: number) {
        super();
    }
}
