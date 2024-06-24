import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServersModule } from './servers/servers.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot(), ServersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
