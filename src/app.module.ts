import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MapGatewayModule } from './gateway/map/map-gateway.module';
import { ProfileGatewayModule } from './gateway/profile/profile-gateway.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MapGatewayModule,
    ProfileGatewayModule,
  ],
})
export class AppModule {}
