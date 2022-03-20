import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from '../auth.service';

@ApiTags('Authentication')
@Controller('auth/twitter')
@UseGuards(AuthGuard('twitter'))
export class TwitterController {
    constructor(private readonly authService: AuthService) {}

    @Get('')
    @ApiOperation({ summary: 'Login using Twitter authentication' })
    public async twitterSignIn() {}

    @Get('callback')
    @ApiOperation({ summary: 'Retrieve the JWT token after logging in using Twitter' })
    public async twitterCallBack(@Req() req, @Res({ passthrough: true }) response) {
        const accessToken = this.authService.returnJwtToken(req);
        response.set({ Authorization: `Bearer ${accessToken}` });
        return accessToken;
    }
}
