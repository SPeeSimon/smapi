import { Body, Controller, Get, HttpException, HttpStatus, Inject, Logger, Param, Post } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiTags, ApiOkResponse, ApiOperation, ApiBadRequestResponse, ApiInternalServerErrorResponse } from '@nestjs/swagger';
import { AuthorsService } from 'src/authors/authors.service';
import { EmailFactory, SendTo } from 'src/notifications/emailcontent';
import { LoggedInUser } from './loggedinuser';
import { RequireTokenAuthentication } from './auth.decorator';
import { AuthService } from './auth.service';
import { LinkAuthorDto } from './dto/link-author.dto';
import { User } from './dto/User.entity';
import { JsonWebTokenError } from "jsonwebtoken";
import { EntityNotFoundError } from 'typeorm';
import { Author } from 'src/dao/entities/author.entity';
import { AuthenticationDetails } from './auth.module';


class LinkAuthorJwtToken {
    iss= `Flightgear API`;
    sub= 'linkauthor';
    authorize: {user: string, email: string, authority: number};
    authorized_by: {user: number|string, email: string};

    constructor(newAuthor: Author, authority: number, authorizedBy: User) {
        this.authorize = {user: newAuthor.id, email: newAuthor.email, authority: authority};
        this.authorized_by = {user: authorizedBy.author.id, email: authorizedBy.author.email};
    }

    getAsPlain() {
        return {
            iss: this.iss,
            jti: Math.random(),
            sub: this.sub,
            authorize: this.authorize,
            authorized_by: this.authorized_by,
        };
    }
}


@ApiTags('Authentication')
@Controller('/auth/linkauthor')
export class LinkAuthorController {
    private supportedStrategyCodes = [];

    constructor(
        private readonly authService: AuthService,
        private readonly authorService: AuthorsService,
        private readonly jwtService: JwtService,
        @Inject('SUPPORTED_AUTHENTICATION_STRATEGIES') private readonly strategies: AuthenticationDetails[]
    ) {
        this.supportedStrategyCodes = strategies.map(s => s.code);
    }


    @Get('/checkmail/:email')
    @RequireTokenAuthentication()
    @ApiOkResponse({ description: 'check if author with email exists' })
    async checkAuthorEmail(@Param('email') email: string) {
        const author = await this.findSingleAuthorByEmail(email);
        return author || {};
    }


    @Post()
    @ApiBadRequestResponse({ description: 'No valid input was supplied'})
    @ApiInternalServerErrorResponse({ description: 'Could not save the author in db or send email'})
    @RequireTokenAuthentication()
    async doLinkAuthor(@Body() linkAuthor: LinkAuthorDto, @LoggedInUser() user: User) {
        const hasLoginStrategy = this.supportedStrategyCodes.includes(linkAuthor.authority);
        if (!hasLoginStrategy) {
            throw new HttpException(`Unknown authentication strategy id`, HttpStatus.BAD_REQUEST);
        }

        let author = await this.findSingleAuthorByEmail(linkAuthor.email);
        if (!author) {
            Logger.log(`creating author: ${linkAuthor.email}`)
            author = await this.authorService.create(linkAuthor);
        }

        Logger.log(`linked author ${linkAuthor.email} to ${author.id}`)
        const token = this.jwtService.sign(new LinkAuthorJwtToken(author, linkAuthor.authority, user).getAsPlain(), { expiresIn: '1d' });
        const linkUrl = `${process.env.API_URL}/auth/linkauthor/${token}`;

        const email = EmailFactory.getAuthorEmailVerifyEmailContent(linkUrl, token);
        new EmailFactory().send(email, author.email, SendTo.USER);

        return linkUrl;
    }


    @ApiOperation({ description: 'Use a token to verify the email address for an Author. Adds an authentication record so the author can log in with the Oauth provider that was supplied during creating the token' })
    @ApiOkResponse({ description: 'The Author with the email address is verified and can now log in' })
    @Get('/:token')
    async linkAuthorToToken(@Param('token') token: string) {
        const verified = this.verifyLinkToken(token);
        console.log(verified)
        const authorToLink = await this.findSingleAuthorByEmail(verified.authorize.email);

        if (!authorToLink) {
            throw new EntityNotFoundError(Author, {});
        }

        Logger.debug(`Adding author ${verified.authorize.email} (id: ${verified.authorize.user}) with authentication ${verified.authorize.authority}`, 'Authentication')
        return this.authService.addAuthorAuthentication(authorToLink.id, verified.authorize.authority)
                    .then(r => 'success');
    }


    private async findSingleAuthorByEmail(email: string) {
        return [...await this.authorService.findByEmail(email)].shift();
    }

    private verifyLinkToken(token: string) : LinkAuthorJwtToken {
        try {
            const verified = this.jwtService.verify(token, {ignoreExpiration: false, issuer: `Flightgear API`, subject: 'linkauthor', maxAge: '1d'});
            if (new Date(verified.exp * 1000) > new Date()) {
                console.log('valid until', new Date(verified.exp * 1000), new Date(verified.exp * 1000) < new Date(), new Date() < new Date(verified.exp * 1000))
            }
            console.log('issued at', new Date(1656092442409), new Date(1656092442409*1000))
            return verified;
        } catch (error) {
            console.log(error)
            if (error instanceof JsonWebTokenError) {
                throw new HttpException('Token expired or invalid', HttpStatus.NOT_ACCEPTABLE);
            }
            throw new HttpException('Error during token validation', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
