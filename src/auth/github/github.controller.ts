import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from '../auth.service';

@ApiTags('Authentication')
@Controller('auth/github')
@UseGuards(AuthGuard('github'))
export class GithubController {
    constructor(private readonly authService: AuthService) {}

    @Get('')
    @ApiOperation({ summary: 'Login using Github authentication' })
    public async githubSignIn() {
    }

    @Get('callback')
    @ApiOperation({ summary: 'Retrieve the JWT token after logging in using Github' })
    public async githubCallback(@Req() req, @Res({ passthrough: true }) response) {
        const accessToken = this.authService.returnJwtToken(req);
        response.set({ Authorization: `Bearer ${accessToken}` });
        return accessToken;
    }
}
