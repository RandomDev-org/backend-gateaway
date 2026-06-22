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
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { CreatePointDto } from '../dto/create-point.dto';
import { UpdatePointDto } from '../dto/update-point.dto';

@Controller('map')
export class MapGatewayController {
  constructor(
    @Inject('MAPS_SERVICE')
    private readonly mapsClient: ClientProxy,
  ) {}

  @Get('points')
  findAll() {
    return lastValueFrom(this.mapsClient.send({ cmd: 'map.findAll' }, {}));
  }

  @Get('points/nearby')
  findNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius: string,
  ) {
    return lastValueFrom(
      this.mapsClient.send(
        { cmd: 'map.findNearby' },
        {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          radius: parseFloat(radius),
        },
      ),
    );
  }

  @Get('points/bounds')
  findByBounds(
    @Query('neLat') neLat: string,
    @Query('neLng') neLng: string,
    @Query('swLat') swLat: string,
    @Query('swLng') swLng: string,
  ) {
    return lastValueFrom(
      this.mapsClient.send(
        { cmd: 'map.findByBounds' },
        {
          neLat: parseFloat(neLat),
          neLng: parseFloat(neLng),
          swLat: parseFloat(swLat),
          swLng: parseFloat(swLng),
        },
      ),
    );
  }

  @Get('points/:id')
  findOne(@Param('id') id: string) {
    return lastValueFrom(this.mapsClient.send({ cmd: 'map.findOne' }, { id }));
  }

  @Post('points')
  create(@Body() dto: CreatePointDto) {
    return lastValueFrom(this.mapsClient.send({ cmd: 'map.create' }, dto));
  }

  @Put('points/:id')
  update(@Param('id') id: string, @Body() dto: UpdatePointDto) {
    return lastValueFrom(
      this.mapsClient.send({ cmd: 'map.update' }, { id, dto }),
    );
  }

  @Delete('points/:id')
  remove(@Param('id') id: string) {
    return lastValueFrom(this.mapsClient.send({ cmd: 'map.remove' }, { id }));
  }
}
