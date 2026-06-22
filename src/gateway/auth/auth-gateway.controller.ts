import {
  Controller,
  Post,
  Body,
  Inject,
  HttpCode,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { lastValueFrom, timeout, catchError, throwError } from 'rxjs';

@Controller('auth')
export class AuthGatewayController {
  private readonly logger = new Logger(AuthGatewayController.name);

  constructor(
    @Inject('PROFILE_SERVICE')
    private readonly profileClient: ClientProxy,
  ) {}

  private async send<T>(pattern: any, data: any): Promise<T> {
    try {
      return await lastValueFrom(
        this.profileClient.send(pattern, data).pipe(
          timeout(10000),
          catchError((err) => {
            this.logger.error(`TCP error for ${JSON.stringify(pattern)}: ${err.message}`);
            return throwError(() => err);
          }),
        ),
      );
    } catch (err: any) {
      if (err instanceof RpcException) {
        throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
      }
      if (err.name === 'TimeoutError') {
        throw new HttpException(
          'Servicio de autenticación no respondió a tiempo',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      if (err.code === 'ECONNREFUSED' || err.message?.includes('ECONNREFUSED')) {
        throw new HttpException(
          'Servicio de autenticación no disponible',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      throw new HttpException(
        err.message ?? 'Error interno',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: { email: string; password: string; name: string }) {
    return this.send('auth.register', dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: { email: string; password: string }) {
    return this.send('auth.login', dto);
  }
}
