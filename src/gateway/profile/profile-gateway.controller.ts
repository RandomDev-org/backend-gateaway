import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  Query,
  Inject,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { lastValueFrom, timeout, catchError, throwError } from 'rxjs';

@Controller('profiles')
export class ProfileGatewayController {
  private readonly logger = new Logger(ProfileGatewayController.name);

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
          'Servicio de perfiles no respondió a tiempo',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      if (err.code === 'ECONNREFUSED' || err.message?.includes('ECONNREFUSED')) {
        throw new HttpException(
          'Servicio de perfiles no disponible',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      throw new HttpException(
        err.message ?? 'Error interno',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.send('profile.findOne', { id });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Record<string, unknown>) {
    return this.send('profile.update', { id, dto });
  }

  @Get(':userId/preferences')
  getPreferences(@Param('userId') userId: string) {
    return this.send('get_user_preferences', { userId });
  }

  @Put(':userId/preferences')
  updatePreferences(
    @Param('userId') userId: string,
    @Body() dto: Record<string, unknown>,
  ) {
    return this.send('update_user_preferences', { userId, ...dto });
  }

  @Get(':userId/history')
  getHistory(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.send('get_user_history', {
      userId,
      query: {
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
      },
    });
  }

  @Post(':userId/history')
  addHistoryEntry(
    @Param('userId') userId: string,
    @Body() dto: Record<string, unknown>,
  ) {
    return this.send('add_history_entry', { userId, dto });
  }

  @Delete(':userId/history/:entryId')
  deleteHistoryEntry(
    @Param('userId') userId: string,
    @Param('entryId') entryId: string,
  ) {
    return this.send('delete_history_entry', { userId, entryId });
  }

  @Get(':userId/history/stats')
  getHistoryStats(@Param('userId') userId: string) {
    return this.send('get_user_history_stats', { userId });
  }
}
