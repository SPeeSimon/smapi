import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from '../auth.service';

@ApiTags('Authentication')
@Controller('auth/facebook')
@UseGuards(AuthGuard('facebook'))
export class FacebookAuthController {
    constructor(private readonly authService: AuthService) {}

    @Get('')
    @ApiOperation({ summary: 'Login using Facebook authentication' })
    public async facebookSignIn() {}

    @Get('callback')
    @ApiOperation({ summary: 'Retrieve the JWT token after logging in using Facebook' })
    public async facebookCallBack(@Req() req, @Res({ passthrough: true }) response) {
        const accessToken = this.authService.returnJwtToken(req);
        response.set({ Authorization: `Bearer ${accessToken}` });
        return accessToken;
    }
}
