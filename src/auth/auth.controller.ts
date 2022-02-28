import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiOkResponse, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { Request, Response } from 'express';
import { AUTHENTICATION_PROPERTY, JWT_CONSTANTS } from './auth.module';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { AuthenticationPayload } from './dto/token-payload.dto';
import { User } from './entities/user.entity';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService, private jwtService: JwtService) {}

    @Get('facebook')
    @UseGuards(AuthGuard('facebook'))
    @ApiOperation({ summary: 'Login using Facebook authentication' })
    public async facebookSignIn() {}
    
    @Get('facebook/callback')
    @UseGuards(AuthGuard('facebook'))
    @ApiOperation({ summary: 'Retrieve the JWT token after logging in using Facebook' })
    public async facebookCallBack(@Req() req, @Res({ passthrough: true }) response) {
        const accessToken = this.returnJwtToken(req);
        response.set({ 'Authorization': `Bearer ${accessToken}`});
        return accessToken;
    }

    @Get('github')
    @UseGuards(AuthGuard('github'))
    @ApiOperation({ summary: 'Login using Github authentication' })
    public async githubSignIn() {}

    @Get('github/callback')
    @UseGuards(AuthGuard('github'))
    @ApiOperation({ summary: 'Retrieve the JWT token after logging in using Github' })
    public async githubCallBack(@Req() req, @Res({ passthrough: true }) response) {
        const accessToken = this.returnJwtToken(req);
        response.set({ 'Authorization': `Bearer ${accessToken.access_token}`});
        return accessToken;
    }
    
    @Get('google')
    @UseGuards(AuthGuard('google'))
    @ApiOperation({ summary: 'Login using Google authentication' })
    public async googleSignIn() {}    
    
    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    @ApiOperation({ summary: 'Retrieve the JWT token after logging in using Google' })
    public async googleCallback(@Req() req, @Res({ passthrough: true }) response) {
        const accessToken = this.returnJwtToken(req);
        response.set({ 'Authorization': `Bearer ${accessToken}`});
        return accessToken;
    }

    @Post('local')
    @UseGuards(AuthGuard('local'))
    public async localSignIn(@Req() req, @Res({ passthrough: true }) response) {
        const accessToken = this.returnJwtToken(req);
        response.set({ 'Authorization': `Bearer ${accessToken}`});
        return accessToken;
    }
    
    @Get('twitter')
    @UseGuards(AuthGuard('twitter'))
    @ApiOperation({ summary: 'Login using Twitter authentication' })
    public async twitterSignIn() {}
    
    @Get('twitter/callback')
    @UseGuards(AuthGuard('twitter'))
    @ApiOperation({ summary: 'Retrieve the JWT token after logging in using Twitter' })
    public async twitterCallBack(@Req() req, @Res({ passthrough: true }) response) {
        const accessToken = this.returnJwtToken(req);
        response.set({ 'Authorization': `Bearer ${accessToken}`});
        return accessToken;
    }
    
    private returnJwtToken(req: any) {
        const user = req[AUTHENTICATION_PROPERTY] as User;
        const authenticationPayload = new AuthenticationPayload(`Flightgear API`, Math.random(), user, new Date());
        return {
            access_token: this.jwtService.sign(authenticationPayload.getAsPlain()),
            token_type: 'Bearer',
            expires_in: JWT_CONSTANTS.ttl,
        };
    }

    @Get('logout')
    public logout(@Req() request: Request, @Res() response: Response) {
        // request.logout(); 
        response.redirect('/');
    }

    @Get('/linkauthor/:token')
    linkAuthorToToken() {
        // jwt.verify(request.params.token, auth.jwtAuth.secret, function (err, decoded) {
        //     if (err) {
        //       return response.status(404).send("Unknown token");
        //     }
      
        //     var email = decoded.data.email;
        //     var id = decoded.data.a;
        //     var extuser_id = decoded.data.b;
      
        //     console.log("linking", email, id, extuser_id);
        //     DB.getAuthorByEmail(email, function (err, user) {
        //       if (err) {
        //         return response.status(500).send("Database Error");
        //       }
        //       if (!user) {
        //         return response.status(404).send("Unknown user");
        //       }
        //       DB.SetAuthorForExternalUser(id, extuser_id, user.au_id, function (err) {
        //         if (err) {
        //           return response.status(500).send("Database Error: can't link");
        //         }
        //         return response.redirect("/login");
        //       });
        //     });
        //   });
    }

    @Get('/linkauthor/checkmail/:email')
    checkAuthorEmail(@Req() request: Request, @Res() response: Response) {
        // DB.getAuthorByEmail(request.params.email, function (err, data) {
        //     if (err) {
        //       return response.status(500).send("Database Error");
        //     }
        //     if (!data) {
        //       return response.json({});
        //     }
        //     return response.json({
        //       name: data.au_name || "",
        //       email: data.au_email || "",
        //       notes: data.au_notes || "",
        //     });
        //   });
    }

    @Post()
    doLinkAuthor(@Req() request: Request, @Res() response: Response) {
        var re =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (!re.test(request.body.email)) {
        return response.render("linkauthor", { user: request['user'], data: request.body });
      }
  
    //   DB.getOrCreateAuthorByEmail(
    //     {
    //       email: request.body.email,
    //       name: request.body.name,
    //       notes: request.body.notes,
    //     },
    //     function (err, author) {
    //       if (err) {
    //         return response.status(500).send("Database Error");
    //       }
    //       var token = jwt.sign(
    //         {
    //           data: {
    //             email: author.au_email,
    //             a: request.user.authority.id,
    //             b: request.user.authority.user_id,
    //           },
    //         },
    //         auth.jwtAuth.secret,
    //         { expiresIn: "1d", issuer: "http://scenery.flightgear.org/", subject: "linkauthor" }
    //       );
  
    //       var LinkUrl = "http://caravan:3001/linkauthor/" + token;
    //       console.log("veryfy Link is ", LinkUrl);
    //       transporter.sendMail(
    //         {
    //           from: '"FlightGear Scenery Database"<no-reply@flightgear.org>',
    //           to: request.body.email,
    //           subject: "FlightGear Scenery Database - email verification",
    //           text: "Please verify your email address by following this link: " + LinkUrl,
    //         },
    //         function (err, info) {
    //           if (err) {
    //             console.log("Error sending confirmation email", err);
    //           } else {
    //             console.log("Sent confirmation email", info);
    //           }
    //         }
    //       );
    //       return response.redirect("/");
    //     }
    //   );
    // }
    }

    @Get('test')
    @UseGuards(AuthGuard())
    @ApiOperation({ summary: 'Test to see if you are logged in' })
    @ApiOkResponse({ description: 'You are logged in'})
    @ApiUnauthorizedResponse({ description: 'You are not logged in'})
    testAuth(@Req() request) {
        return 'logged in';
    }

}
