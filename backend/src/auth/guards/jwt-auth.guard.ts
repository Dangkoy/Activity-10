import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization;
    
    // Log detailed error information
    if (err || !user) {
      console.error('JwtAuthGuard: Authentication failed', {
        error: err?.message || err,
        info: info?.message || info,
        hasUser: !!user,
        hasAuthHeader: !!authHeader,
        authHeaderPrefix: authHeader?.substring(0, 20) || 'none',
        path: request.url,
        method: request.method,
      });
      
      // Handle different Passport JWT error types
      if (info) {
        if (info.message === 'No auth token' || info.name === 'UnauthorizedError') {
          throw new UnauthorizedException('No authentication token provided');
        }
        if (info.message === 'jwt expired') {
          throw new UnauthorizedException('Token has expired. Please log in again.');
        }
        if (info.message === 'invalid signature' || info.message === 'jwt malformed') {
          throw new UnauthorizedException('Invalid token. Please log in again.');
        }
        if (info.message) {
          throw new UnauthorizedException(`Authentication failed: ${info.message}`);
        }
      }
      
      if (err) {
        throw err;
      }
      
      throw new UnauthorizedException('Authentication required');
    }
    
    console.log('JwtAuthGuard: Authentication successful for user:', user?.email || 'unknown');
    return user;
  }
}
