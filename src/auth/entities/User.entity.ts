import { Author } from 'src/authors/entities/author.entity';
import { UserAuthenticationMethod } from './UserAuthenticationMethod.entity';


export class User {
    author: Author;
    authenticationMethods: UserAuthenticationMethod[];
}
