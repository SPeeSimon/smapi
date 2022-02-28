import { Module, NestModule, Logger, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthenticationStrategyService } from './strategies/jwt.strategy';
import { Author } from 'src/authors/entities/author.entity';
import { UserAuthenticationMethod } from './entities/UserAuthenticationMethod.entity';
import { LocalAuthStrategyService } from './strategies/local.strategy';
import { GithubAuthStrategyService } from './strategies/github.strategy';
import { FacebookAuthStrategyService } from './strategies/facebook.strategy';
import { GoogleAuthStrategyService } from './strategies/google.strategy';
import { TwitterAuthStrategyService } from './strategies/twitter.strategy';
import * as passport from 'passport';

export const AUTHENTICATION_PROPERTY = 'auth-user';
export const JWT_CONSTANTS = {
    secret: 'secretKey',
    ttl: 600,
};

export function getCallbackUrl(suffix: string) {
  var urlPrefix = "http://localhost:3000/";
  if (process.env.node_env !== "development") {
    urlPrefix = process.env.urlprefix;
    if (!urlPrefix) {
      Logger.error("urlprefix environment not set! Users will not be able to login", 'Authentication');
      urlPrefix = "";
    }
  }
  urlPrefix = urlPrefix.replace(/\/+$/, "");
  return urlPrefix + "/" + suffix.replace(/^\/+/, "");
}

@Module({
    imports: [
        PassportModule.register({
            defaultStrategy: 'jwt',
            property: AUTHENTICATION_PROPERTY,
            session: false,
        }),
        JwtModule.register({
            secret: JWT_CONSTANTS.secret,
            signOptions: { expiresIn: JWT_CONSTANTS.ttl },
        }),
        TypeOrmModule.forFeature([Author, UserAuthenticationMethod]),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        // LocalAuthStrategyService,
        JwtAuthenticationStrategyService,
        FacebookAuthStrategyService,
        GithubAuthStrategyService,
        GoogleAuthStrategyService,
        TwitterAuthStrategyService,
    ],
    exports: [PassportModule, JwtModule],
})
export class AuthModule {
}


/*
 TODO??
 - gitLab
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