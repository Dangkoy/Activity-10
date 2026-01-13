import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../users/entities/user.entity';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    console.log('AuthService: Registering user:', { email: registerDto.email, role: registerDto.role });
    
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      console.warn('AuthService: Email already registered:', registerDto.email);
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
    });

    console.log('AuthService: Creating user with role:', user.role);
    const savedUser = await this.userRepository.save(user);
    console.log('AuthService: User saved successfully:', { id: savedUser.id, email: savedUser.email, role: savedUser.role, isActive: savedUser.isActive });
    
    const { password, ...result } = savedUser;

    return {
      ...result,
      accessToken: this.jwtService.sign({ sub: savedUser.id, email: savedUser.email, role: savedUser.role }),
    };
  }

  async login(loginDto: LoginDto) {
    console.log('AuthService: Login attempt for email:', loginDto.email);
    
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      console.warn('AuthService: User not found for email:', loginDto.email);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      console.warn('AuthService: User is inactive:', { id: user.id, email: user.email, role: user.role });
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      console.warn('AuthService: Invalid password for user:', user.email);
      throw new UnauthorizedException('Invalid credentials');
    }

    console.log('AuthService: Login successful:', { id: user.id, email: user.email, role: user.role, isActive: user.isActive });
    const { password, ...result } = user;

    return {
      ...result,
      accessToken: this.jwtService.sign({ sub: user.id, email: user.email, role: user.role }),
    };
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ 
      where: { id: userId },
      select: ['id', 'email', 'fullName', 'company', 'role', 'isActive', 'createdAt', 'updatedAt'],
    });
    
    if (!user) {
      console.error('AuthService: User not found for ID:', userId);
      throw new UnauthorizedException('User not found');
    }
    
    console.log('AuthService: User found:', { id: user.id, email: user.email, role: user.role, isActive: user.isActive });
    
    if (!user.isActive) {
      console.error('AuthService: User is inactive:', { id: user.id, email: user.email, role: user.role });
      throw new UnauthorizedException('User account is inactive');
    }
    
    return user;
  }
}
