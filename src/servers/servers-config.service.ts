import { Injectable, Logger } from '@nestjs/common';
import { servers } from './constant/servers';
import { Server } from './interfaces/server.interface';

@Injectable()
export class ServersConfigService {
  private readonly logger = new Logger(ServersConfigService.name);

  getConfiguredServers(): Server[] {
    return servers;
  }

  getConfiguredTimeout(): number {
    return 5000;
  }
}
