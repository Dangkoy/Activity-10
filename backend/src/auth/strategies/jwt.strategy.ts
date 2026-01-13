import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { User } from '../../users/entities/user.entity';

// Use the same secret as in AuthModule
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
    });
    console.log('JwtStrategy initialized with secret:', JWT_SECRET ? 'SECRET_SET' : 'NO_SECRET');
  }

  async validate(payload: any): Promise<User> {
    try {
      if (!payload.sub) {
        console.error('JWT Strategy: Invalid token payload - missing sub:', payload);
        throw new UnauthorizedException('Invalid token payload');
      }
      
      console.log('JWT Strategy: Validating user with ID:', payload.sub);
      const user = await this.authService.validateUser(payload.sub);
      
      if (!user) {
        console.error('JWT Strategy: User not found for ID:', payload.sub);
        throw new UnauthorizedException('User not found');
      }
      
      if (!user.isActive) {
        console.error('JWT Strategy: User is inactive:', { id: user.id, email: user.email, role: user.role, isActive: user.isActive });
        throw new UnauthorizedException(`User account is inactive. Please contact support.`);
      }
      
      console.log('JWT Strategy: User validated successfully:', { 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        roleType: typeof user.role,
        isActive: user.isActive 
      });
      return user;
    } catch (error) {
      console.error('JWT Strategy: Validation error:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
