import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiOkResponse, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { Request, Response } from 'express';
import { AuthService } from './auth.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('local')
    @UseGuards(AuthGuard('local'))
    public async localSignIn(@Req() req, @Res({ passthrough: true }) response) {
        const accessToken = this.authService.returnJwtToken(req);
        response.set({ 'Authorization': `Bearer ${accessToken}`});
        return accessToken;
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
    @ApiOkResponse({ description: 'You are logged in.'})
    @ApiUnauthorizedResponse({ description: 'You are NOT logged in.'})
    testAuth(@Req() request) {
        return 'logged in';
    }

}
