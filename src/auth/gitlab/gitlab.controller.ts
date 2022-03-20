import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from '../auth.service';

@ApiTags('Authentication')
@Controller('auth/gitlab')
@UseGuards(AuthGuard('gitlab'))
export class GitlabController {
    constructor(private readonly authService: AuthService) {}

    @Get('')
    @ApiOperation({ summary: 'Login using Gitlab authentication' })
    public async githubSignIn() {
    }

    @Get('callback')
    @ApiOperation({ summary: 'Retrieve the JWT token after logging in using Gitlab' })
    public async githubCallback(@Req() req, @Res({ passthrough: true }) response) {
        const accessToken = this.authService.returnJwtToken(req);
        response.set({ Authorization: `Bearer ${accessToken}` });
        return accessToken;
    }
}
