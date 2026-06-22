import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MapGatewayController } from './map-gateway.controller';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'MAPS_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get<string>('MAPS_HOST', 'localhost'),
            port: config.get<number>('MAPS_TCP_PORT', 3001),
          },
        }),
      },
    ]),
  ],
  controllers: [MapGatewayController],
})
export class MapGatewayModule {}
