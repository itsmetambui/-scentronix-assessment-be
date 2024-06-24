import { Module } from '@nestjs/common';
import { ServersController } from './servers.controller';
import { HttpModule } from '@nestjs/axios';
import { ServersService } from './servers.service';
import { ConfigModule } from '@nestjs/config';
import { HttpConfigService } from 'src/http.service';
import { ServersConfigService } from './servers-config.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useClass: HttpConfigService,
    }),
  ],
  controllers: [ServersController],
  providers: [ServersService, ServersConfigService],
})
export class ServersModule {}
