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
  OnModuleInit,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { lastValueFrom, timeout } from 'rxjs';

@Controller('profiles')
export class ProfileGatewayController implements OnModuleInit {
  private readonly logger = new Logger(ProfileGatewayController.name);

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
        throw new HttpException('Servicio de perfiles no disponible (timeout)', HttpStatus.SERVICE_UNAVAILABLE);
      }
      this.logger.error(`Error in ${JSON.stringify(pattern)}: ${err.message || err}`);
      throw new HttpException(
        err?.message || 'Error en el servicio de perfiles',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.send({ cmd: 'profile.findOne' }, { id });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Record<string, unknown>) {
    return this.send({ cmd: 'profile.update' }, { id, dto });
  }

  @Get(':userId/preferences')
  getPreferences(@Param('userId') userId: string) {
    return this.send({ cmd: 'get_user_preferences' }, { userId });
  }

  @Put(':userId/preferences')
  updatePreferences(
    @Param('userId') userId: string,
    @Body() dto: Record<string, unknown>,
  ) {
    return this.send({ cmd: 'update_user_preferences' }, { userId, ...dto });
  }

  @Get(':userId/history')
  getHistory(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.send({ cmd: 'get_user_history' }, {
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
    return this.send({ cmd: 'add_history_entry' }, { userId, dto });
  }

  @Delete(':userId/history/:entryId')
  deleteHistoryEntry(
    @Param('userId') userId: string,
    @Param('entryId') entryId: string,
  ) {
    return this.send({ cmd: 'delete_history_entry' }, { userId, entryId });
  }

  @Get(':userId/history/stats')
  getHistoryStats(@Param('userId') userId: string) {
    return this.send({ cmd: 'get_user_history_stats' }, { userId });
  }
}
