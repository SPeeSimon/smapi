import { Author } from 'src/dao/entities/author.entity';
import { UserAuthenticationMethod } from '../../dao/entities/UserAuthenticationMethod.entity';


export class User {
    author: Author;
    authenticationMethods: UserAuthenticationMethod[];
}
