import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from '../auth.service';

@ApiTags('Authentication')
@Controller('auth/google')
@UseGuards(AuthGuard('google'))
export class GoogleController {
    constructor(private readonly authService: AuthService) {}

    @Get('')
    @ApiOperation({ summary: 'Login using Google authentication' })
    public async googleSignIn() {}

    @Get('callback')
    @ApiOperation({ summary: 'Retrieve the JWT token after logging in using Google' })
    public async googleCallback(@Req() req, @Res({ passthrough: true }) response) {
        const accessToken = this.authService.returnJwtToken(req);
        response.set({ Authorization: `Bearer ${accessToken}` });
        return accessToken;
    }
}
