import {
  Controller,
  Get,
  Put,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Controller('profiles')
export class ProfileGatewayController {
  constructor(
    @Inject('PROFILE_SERVICE')
    private readonly profileClient: ClientProxy,
  ) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return lastValueFrom(
      this.profileClient.send({ cmd: 'profile.findOne' }, { id }),
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: Record<string, unknown>,
  ) {
    return lastValueFrom(
      this.profileClient.send({ cmd: 'profile.update' }, { id, dto }),
    );
  }

  @Get(':userId/preferences')
  getPreferences(@Param('userId') userId: string) {
    return lastValueFrom(
      this.profileClient.send({ cmd: 'get_user_preferences' }, { userId }),
    );
  }

  @Put(':userId/preferences')
  updatePreferences(
    @Param('userId') userId: string,
    @Body() dto: Record<string, unknown>,
  ) {
    return lastValueFrom(
      this.profileClient.send(
        { cmd: 'update_user_preferences' },
        { userId, ...dto },
      ),
    );
  }

  @Get(':userId/history')
  getHistory(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return lastValueFrom(
      this.profileClient.send(
        { cmd: 'get_user_history' },
        {
          userId,
          query: {
            page: page ? parseInt(page) : undefined,
            limit: limit ? parseInt(limit) : undefined,
          },
        },
      ),
    );
  }

  @Post(':userId/history')
  addHistoryEntry(
    @Param('userId') userId: string,
    @Body() dto: Record<string, unknown>,
  ) {
    return lastValueFrom(
      this.profileClient.send({ cmd: 'add_history_entry' }, { userId, dto }),
    );
  }

  @Delete(':userId/history/:entryId')
  deleteHistoryEntry(
    @Param('userId') userId: string,
    @Param('entryId') entryId: string,
  ) {
    return lastValueFrom(
      this.profileClient.send(
        { cmd: 'delete_history_entry' },
        { userId, entryId },
      ),
    );
  }

  @Get(':userId/history/stats')
  getHistoryStats(@Param('userId') userId: string) {
    return lastValueFrom(
      this.profileClient.send({ cmd: 'get_user_history_stats' }, { userId }),
    );
  }
}
