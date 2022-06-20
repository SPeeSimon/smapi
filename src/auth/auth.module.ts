import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthenticationStrategyService } from './strategies/jwt.strategy';
import { Author } from 'src/dao/entities/author.entity';
import { UserAuthenticationMethod } from '../dao/entities/UserAuthenticationMethod.entity';
import { FacebookAuthenticationDetails, FacebookModule } from './facebook/facebook.module';
import { GithubAuthenticationDetails, GithubModule } from './github/github.module';
import { GoogleAuthenticationDetails, GoogleModule } from './google/google.module';
import { TwitterAuthenticationDetails, TwitterModule } from './twitter/twitter.module';
import { GitlabAuthenticationDetails, GitlabModule } from './gitlab/gitlab.module';
import { LinkAuthorController } from './link-author.controller';
import { AuthorsModule } from '../authors/authors.module';
import { AUTHENTICATION_PROPERTY } from './loggedinuser';

export const JWT_CONSTANTS = {
    secret: () => process.env.JWT_SECRET || 'default secret key',
    ttl: 600,
};

@Module({
    imports: [
        forwardRef(() => AuthorsModule),
        ConfigModule.forRoot(),
        PassportModule.register({
            defaultStrategy: 'jwt',
            property: AUTHENTICATION_PROPERTY,
            session: false,
        }),
        JwtModule.register({
            secret: JWT_CONSTANTS.secret(),
            signOptions: { expiresIn: JWT_CONSTANTS.ttl },
        }),
        TypeOrmModule.forFeature([Author, UserAuthenticationMethod]),
        forwardRef(() => GithubModule.registerIfEnabled(process.env.AUTH_GITHUB_ENABLED === 'true')),
        forwardRef(() => GoogleModule.registerIfEnabled(process.env.AUTH_GOOGLE_ENABLED === 'true')),
        forwardRef(() => FacebookModule.registerIfEnabled(process.env.AUTH_FACEBOOK_ENABLED === 'true')),
        forwardRef(() => TwitterModule.registerIfEnabled(process.env.AUTH_TWITTER_ENABLED === 'true')),
        forwardRef(() => GitlabModule.registerIfEnabled(process.env.AUTH_GITLAB_ENABLED === 'true')),
    ],
    controllers: [AuthController, LinkAuthorController],
    providers: [
        AuthService,
        // LocalAuthStrategyService,
        JwtAuthenticationStrategyService,
        {
            provide: 'SUPPORTED_AUTHENTICATION_STRATEGIES',
            useFactory: (...args: AuthenticationDetails[]) =>
                args
                    .filter((s) => s.code !== -1),
            inject: [
                GithubAuthenticationDetails,
                GoogleAuthenticationDetails,
                FacebookAuthenticationDetails,
                TwitterAuthenticationDetails,
                GitlabAuthenticationDetails,
                /* Add here another strategy if you implement a new one */
            ],
        },
    ],
    exports: [PassportModule, JwtModule, AuthService],
})
export class AuthModule {}


export interface AuthenticationDetails {
    get code(): number;
    get name(): string;
    get url(): string;
}

export const NoAuthStrategy = {
    code: -1,
    name: '',
    url: ''
} as AuthenticationDetails;

/*
 TODO implement other login possibilities?
 - slack
 - microsoft
 - linkedin
 - discord
 - atlassian
 - bitbucket
 - apple
 - steam
 - windowslive
 - amazon
 - dropbox
 - twitch
 - reddit
 - wordpress
 - disqus
 - openstreetmap scope:['read_prefs']
 - stackexchange
*/
