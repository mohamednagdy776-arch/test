import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { ok } from '../../common/response.helper';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const tokens = await this.authService.register(dto);
    return ok(tokens, 'Registered successfully');
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const tokens = await this.authService.login(dto);
    return ok(tokens, 'Login successful');
  }
}
