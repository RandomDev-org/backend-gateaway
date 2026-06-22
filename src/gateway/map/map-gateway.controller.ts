import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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
import { CreatePointDto } from '../dto/create-point.dto';
import { UpdatePointDto } from '../dto/update-point.dto';

@Controller('map')
export class MapGatewayController implements OnModuleInit {
  private readonly logger = new Logger(MapGatewayController.name);

  constructor(
    @Inject('MAPS_SERVICE')
    private readonly mapsClient: ClientProxy,
  ) {}

  async onModuleInit() {
    try {
      await this.mapsClient.connect();
      this.logger.log('Connected to maps service');
    } catch (err: any) {
      this.logger.error(`Failed to connect to maps service: ${err.message}`);
    }
  }

  private async send<T>(pattern: any, data: any): Promise<T> {
    try {
      return await lastValueFrom(
        this.mapsClient.send(pattern, data).pipe(timeout(15000)),
      );
    } catch (err: any) {
      if (err instanceof RpcException) {
        throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
      }
      if (err.name === 'TimeoutError') {
        throw new HttpException('Servicio de mapas no disponible (timeout)', HttpStatus.SERVICE_UNAVAILABLE);
      }
      this.logger.error(`Error in ${JSON.stringify(pattern)}: ${err.message || err}`);
      throw new HttpException(
        err?.message || 'Error en el servicio de mapas',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Get('points')
  findAll() {
    return this.send({ cmd: 'map.findAll' }, {});
  }

  @Get('points/nearby')
  findNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius: string,
  ) {
    return this.send({ cmd: 'map.findNearby' }, {
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      radius: parseFloat(radius),
    });
  }

  @Get('points/bounds')
  findByBounds(
    @Query('neLat') neLat: string,
    @Query('neLng') neLng: string,
    @Query('swLat') swLat: string,
    @Query('swLng') swLng: string,
  ) {
    return this.send({ cmd: 'map.findByBounds' }, {
      neLat: parseFloat(neLat),
      neLng: parseFloat(neLng),
      swLat: parseFloat(swLat),
      swLng: parseFloat(swLng),
    });
  }

  @Get('points/:id')
  findOne(@Param('id') id: string) {
    return this.send({ cmd: 'map.findOne' }, { id });
  }

  @Post('points')
  create(@Body() dto: CreatePointDto) {
    return this.send({ cmd: 'map.create' }, dto);
  }

  @Put('points/:id')
  update(@Param('id') id: string, @Body() dto: UpdatePointDto) {
    return this.send({ cmd: 'map.update' }, { id, dto });
  }

  @Delete('points/:id')
  remove(@Param('id') id: string) {
    return this.send({ cmd: 'map.remove' }, { id });
  }

  @Get('events')
  findAllEvents() {
    return this.send({ cmd: 'event.findAll' }, {});
  }

  @Get('points/:pointId/events')
  findEventsByPoint(@Param('pointId') pointId: string) {
    return this.send({ cmd: 'event.findByPoint' }, { pointId });
  }

  @Post('events')
  createEvent(@Body() dto: Record<string, unknown>) {
    return this.send({ cmd: 'event.create' }, dto);
  }

  @Delete('events/:id')
  removeEvent(@Param('id') id: string) {
    return this.send({ cmd: 'event.remove' }, { id });
  }
}
