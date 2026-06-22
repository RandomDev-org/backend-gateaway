import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProfileGatewayController } from './profile-gateway.controller';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'PROFILE_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get<string>('PROFILE_HOST', 'localhost'),
            port: config.get<number>('PROFILE_TCP_PORT', 4002),
          },
        }),
      },
    ]),
  ],
  controllers: [ProfileGatewayController],
})
export class ProfileGatewayModule {}
