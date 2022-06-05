import { Module, Logger, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthenticationStrategyService } from './strategies/jwt.strategy';
import { Author } from 'src/authors/entities/author.entity';
import { UserAuthenticationMethod } from './entities/UserAuthenticationMethod.entity';
import { FacebookModule } from './facebook/facebook.module';
import { GithubModule } from './github/github.module';
import { GoogleModule } from './google/google.module';
import { TwitterModule } from './twitter/twitter.module';
import { GitlabModule } from './gitlab/gitlab.module';


export const AUTHENTICATION_PROPERTY = 'auth-user';
export const JWT_CONSTANTS = {
    secret: () => process.env.JWT_SECRET || 'default secret key',
    ttl: 600,
};

@Module({
    imports: [
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
    controllers: [AuthController],
    providers: [
        AuthService,
        // LocalAuthStrategyService,
        JwtAuthenticationStrategyService,
    ],
    exports: [PassportModule, JwtModule, AuthService],
})
export class AuthModule {}

/*
 TODO??
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
