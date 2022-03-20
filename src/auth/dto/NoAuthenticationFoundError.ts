export class NoAuthenticationFoundError extends Error {
    name: string;

    constructor(public authority: string|number, public externalId: string|number, ...params) {
        super(...params);

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, NoAuthenticationFoundError);
        }

        this.name = 'NoAuthenticationFoundError';
        this.authority = authority;
        this.externalId = externalId;
    }
}
