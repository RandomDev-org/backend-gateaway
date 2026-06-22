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
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { lastValueFrom, timeout, catchError, throwError } from 'rxjs';
import { CreatePointDto } from '../dto/create-point.dto';
import { UpdatePointDto } from '../dto/update-point.dto';

@Controller('map')
export class MapGatewayController {
  private readonly logger = new Logger(MapGatewayController.name);

  constructor(
    @Inject('MAPS_SERVICE')
    private readonly mapsClient: ClientProxy,
  ) {}

  private async send<T>(pattern: any, data: any): Promise<T> {
    try {
      return await lastValueFrom(
        this.mapsClient.send(pattern, data).pipe(
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
          'El servicio de mapas no respondió a tiempo',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      if (err.code === 'ECONNREFUSED' || err.message?.includes('ECONNREFUSED')) {
        throw new HttpException(
          'Servicio de mapas no disponible',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      throw new HttpException(
        err.message ?? 'Error interno',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('points')
  findAll() {
    return this.send('map.findAll', {});
  }

  @Get('points/nearby')
  findNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius: string,
  ) {
    return this.send('map.findNearby', {
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
    return this.send('map.findByBounds', {
      neLat: parseFloat(neLat),
      neLng: parseFloat(neLng),
      swLat: parseFloat(swLat),
      swLng: parseFloat(swLng),
    });
  }

  @Get('points/:id')
  findOne(@Param('id') id: string) {
    return this.send('map.findOne', { id });
  }

  @Post('points')
  create(@Body() dto: CreatePointDto) {
    return this.send('map.create', dto);
  }

  @Put('points/:id')
  update(@Param('id') id: string, @Body() dto: UpdatePointDto) {
    return this.send('map.update', { id, dto });
  }

  @Delete('points/:id')
  remove(@Param('id') id: string) {
    return this.send('map.remove', { id });
  }

  @Get('events')
  findAllEvents() {
    return this.send('event.findAll', {});
  }

  @Get('points/:pointId/events')
  findEventsByPoint(@Param('pointId') pointId: string) {
    return this.send('event.findByPoint', { pointId });
  }

  @Post('events')
  createEvent(@Body() dto: Record<string, unknown>) {
    return this.send('event.create', dto);
  }

  @Delete('events/:id')
  removeEvent(@Param('id') id: string) {
    return this.send('event.remove', { id });
  }
}
