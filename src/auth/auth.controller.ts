import { Controller, Get, Inject, Post, Redirect, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiOkResponse, ApiUnauthorizedResponse, ApiExcludeEndpoint } from "@nestjs/swagger";
import { Request } from 'express';
import { RequireTokenAuthentication } from './auth.decorator';
import { AuthenticationDetails } from './auth.module';
import { AuthService } from './auth.service';


class LoginNameUrl {
    constructor(public name: string, public url: string){}
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    private supportedLoginStrategies = [];

    constructor(private readonly authService: AuthService, @Inject('SUPPORTED_AUTHENTICATION_STRATEGIES') private readonly loginMethods: AuthenticationDetails[]) {
        this.supportedLoginStrategies = loginMethods.map(m => new LoginNameUrl(m.name, m.url));
    }


    @Get('available-methods')
    public availableMethods() {
        return this.supportedLoginStrategies;
    }


    @ApiExcludeEndpoint()
    @Post('local')
    @UseGuards(AuthGuard('local'))
    public async localSignIn(@Req() req, @Res({ passthrough: true }) response) {
        const accessToken = this.authService.returnJwtToken(req);
        response.set({ 'Authorization': `Bearer ${accessToken}`});
        return accessToken;
    }
   

    @Get('logout')
    @Redirect('/')
    public logout(@Req() request: Request) {
        // request.logout(); 
    }


    @Get('test')
    @UseGuards(AuthGuard())
    @ApiOperation({ summary: 'Test to see if you are logged in' })
    @ApiOkResponse({ description: 'You are logged in'})
    @ApiUnauthorizedResponse({ description: 'You are NOT logged in'})
    testAuth() {
        return 'logged in';
    }


    @Get('refresh')
    @ApiOperation({ summary: 'Refresh your JWT token' })
    @ApiOkResponse({ description: 'Your new token'})
    @RequireTokenAuthentication()
    refreshToken(@Req() req, @Res({ passthrough: true }) response) {
        const accessToken = this.authService.returnJwtToken(req);
        response.set({
            Authorization: `Bearer ${accessToken.access_token}`
        });
        return accessToken;
    }

}
