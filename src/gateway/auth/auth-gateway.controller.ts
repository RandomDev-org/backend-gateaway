import { Controller, Post, Body, Inject, HttpCode, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Controller('auth')
export class AuthGatewayController {
  constructor(
    @Inject('PROFILE_SERVICE')
    private readonly profileClient: ClientProxy,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: { email: string; password: string; name: string }) {
    return lastValueFrom(
      this.profileClient.send({ cmd: 'auth.register' }, dto),
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: { email: string; password: string }) {
    return lastValueFrom(
      this.profileClient.send({ cmd: 'auth.login' }, dto),
    );
  }
}
