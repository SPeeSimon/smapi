import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

/**
 * Use this Decorator for endpoints that must be secured.
 * @returns 
 */
export function RequireTokenAuthentication() {
  return applyDecorators(
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: "Authorization token not supplied or expired" }),
  );
}