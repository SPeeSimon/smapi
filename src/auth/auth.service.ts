import { Injectable } from '@nestjs/common';
import { Author } from 'src/authors/entities/author.entity';
import { getConnection } from 'typeorm';
import { User } from './entities/user.entity';
import { UserAuthenticationMethod } from './entities/UserAuthenticationMethod.entity';

function convertRawToSingleUserSingleAuth(result: unknown) {
    const user = new User();
    user.author = {
        id: result['author_au_id'],
        name: result['author_au_name'],
        email: result['author_au_email'],
        description: result['author_au_notes'],
    };
    user.authenticationMethods = [
        {
            external_id: result['extuser_eu_external_id'],
            authority: result['extuser_eu_authority'],
            lastlogin: result['extuser_eu_lastlogin'],
            author: result['extuser_eu_author_id'],
        }
    ];
    return user;
}

function convertRawToSingleUserMultipleAuth(result: unknown[]) {
    result.map(record => convertRawToSingleUserSingleAuth(record))
            .reduce((p,c) => {
                const existing = p.find(r => r.author.id == c.author.id);
                if (existing  == undefined){
                    p.push(c);
                } else {
                    existing.authenticationMethods.push(...c.authenticationMethods);
                }
                return p;
            }, []);
}

@Injectable()
export class AuthService {
    constructor() {}

    validateUser(authorityId: number, email: string) {
        return getConnection()
            .createQueryBuilder()
            .select('author')
            .addFrom(Author, 'author')
            .innerJoinAndSelect(UserAuthenticationMethod, 'extuser', 'author.au_id = extuser.eu_author_id')
            .where('author.email = :email', { email: email })
            .andWhere('extuser.eu_authority = :authId', { authId: authorityId })
            .getRawOne()
            .then((result: unknown) => {
                if (result == undefined) {
                    return result;
                }
                return convertRawToSingleUserSingleAuth(result);
        });
    }

    findUserAuthentication(id, authorityId) {
        return getConnection()
            .createQueryBuilder()
            .select('author')
            .addFrom(Author, 'author')
            .innerJoinAndSelect(UserAuthenticationMethod, 'extuser', 'author.au_id = extuser.eu_author_id')
            .where('author.id = :id', { id: id })
            .andWhere('extuser.eu_authority = :authId', { authId: authorityId })
            .getRawOne()
            .then((result: unknown) => {
                if (result == undefined) {
                    throw new NoAuthenticationFoundError(authorityId, id, 'User with Authentication not found');
                }
                const user = convertRawToSingleUserSingleAuth(result);
                // console.log('last login', result['eu_lastlogin']);
                // user.lastLogin = new Date(); // fixme, get
                // return user;
                console.log('raw result', result, 'converted into', user);
                return result;
        });
    }

    findByAuthor(id: number) {
        return getConnection()
            .createQueryBuilder()
            .select('author')
            .addFrom(Author, 'author')
            .innerJoinAndSelect(UserAuthenticationMethod, 'extuser', 'author.au_id = extuser.eu_author_id')
            .where('author.id = :id', { id: id })
            .getRawMany()
            .then((result: unknown[]) => result.map(record => convertRawToSingleUserSingleAuth(record)));
    }

    async findAll() {
        return getConnection()
            .createQueryBuilder()
            .select('author')
            .addFrom(Author, 'author')
            .innerJoinAndSelect(UserAuthenticationMethod, 'extuser', 'author.au_id = extuser.eu_author_id')
            .getRawMany()
            .then((result: unknown[]) => result.map(record => convertRawToSingleUserSingleAuth(record)));
    }
}



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
