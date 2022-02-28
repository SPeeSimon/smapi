import { User } from "../entities/user.entity";

export class AuthenticationPayload {
    constructor(public iss: string, public jti: number, public sub: User, public iat: Date) {}

    issuer() {
        return this.iss;
    }

    jwtId() {
        return this.jti;
    }

    subject() {
        return this.sub;
    }

    issuedAt() {
        return this.iat;
    }

    getAsPlain() {
        return {
            iss: this.iss,
            jti: this.jti,
            sub: this.sub.author,
            iat: this.iat.getTime(),
        };
    }
}
