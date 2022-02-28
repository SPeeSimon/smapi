import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiBadRequestResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

export function RequireTokenAuthentication() {
  return applyDecorators(
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: "Authorization token not supplied or expired" }),
  );
}