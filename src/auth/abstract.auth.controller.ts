import { Get, Headers, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import * as Eta from 'eta';
import { Request } from 'express';
const path = require('path');

/**
 * Abstract class with the API for authentication and callback when using 
 * an external authentication service.
 */
@ApiTags('Authentication')
export abstract class AbstractAuthController {
    constructor(private readonly authService: AuthService) {}

    @Get('')
    @ApiOperation({ summary: 'Redirect to the external authentication' })
    public async redirectToAuth() {}

    @Get('callback')
    @ApiOperation({ summary: 'Retrieve the JWT token after logging' })
    public async authCallBack(@Req() req: Request, @Res({ passthrough: true }) response, @Headers('accept') acceptResponse: string) {
      const accessToken = this.authService.returnJwtToken(req as any);
      response.set({
          Authorization: `Bearer ${accessToken.access_token}`
      });

      if(acceptResponse.includes('html')) {
        // request does not want a JSON, render an HTML page
        return Eta.renderFile(path.join(__dirname, "./callback.html"), {accessToken: accessToken});
      }
      return accessToken;
    }
}
