import {
  Controller,
  Post,
  Body,
  Inject,
  HttpCode,
  HttpStatus,
  HttpException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { lastValueFrom, timeout } from 'rxjs';

@Controller('auth')
export class AuthGatewayController implements OnModuleInit {
  private readonly logger = new Logger(AuthGatewayController.name);

  constructor(
    @Inject('PROFILE_SERVICE')
    private readonly profileClient: ClientProxy,
  ) {}

  async onModuleInit() {
    try {
      await this.profileClient.connect();
      this.logger.log('Connected to profile service');
    } catch (err: any) {
      this.logger.error(`Failed to connect to profile service: ${err.message}`);
    }
  }

  private async send<T>(pattern: any, data: any): Promise<T> {
    try {
      return await lastValueFrom(
        this.profileClient.send(pattern, data).pipe(timeout(15000)),
      );
    } catch (err: any) {
      if (err instanceof RpcException) {
        throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
      }
      if (err.name === 'TimeoutError') {
        throw new HttpException('Servicio de autenticación no disponible (timeout)', HttpStatus.SERVICE_UNAVAILABLE);
      }
      this.logger.error(`Error in ${JSON.stringify(pattern)}: ${err.message || err}`);
      throw new HttpException(
        err?.message || 'Error en el servicio de autenticación',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: { email: string; password: string; name: string }) {
    return this.send({ cmd: 'auth.register' }, dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: { email: string; password: string }) {
    return this.send({ cmd: 'auth.login' }, dto);
  }
}
