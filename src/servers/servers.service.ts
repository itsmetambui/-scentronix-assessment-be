import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Server, ServerWithStatus } from './interfaces/server.interface';
import {
  Observable,
  catchError,
  forkJoin,
  lastValueFrom,
  map,
  of,
  timeout,
} from 'rxjs';
import { servers } from './constant/servers';
import { ServersConfigService } from './servers-config.service';

@Injectable()
export class ServersService {
  private readonly logger = new Logger(ServersService.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly serversConfigService: ServersConfigService,
  ) {}

  async findServer() {
    const servers = this.serversConfigService.getConfiguredServers();
    const onlineChecks: Observable<ServerWithStatus>[] = servers.map((server) =>
      this.isOnline(server),
    );

    const onlineServers = await lastValueFrom(forkJoin(onlineChecks))
      .then((result) => result.filter((server) => server.isOnline))
      .catch((error) => {
        this.logger.error(error.message);
        return [] as ServerWithStatus[];
      });

    if (onlineServers.length === 0) {
      throw new HttpException(
        'No servers available',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const lowestPriorityServer = this.findLowestPriorityServer(onlineServers);
    const server = {
      url: lowestPriorityServer.url,
      priority: lowestPriorityServer.priority,
    };

    return server;
  }

  private isOnline(server: Server) {
    return this.httpService.get(server.url).pipe(
      timeout(this.serversConfigService.getConfiguredTimeout()),
      map(() => ({ ...server, isOnline: true }) as ServerWithStatus),
      catchError(() => {
        return of({ ...server, isOnline: false } as ServerWithStatus);
      }),
    );
  }

  private findLowestPriorityServer = (servers: ServerWithStatus[]) => {
    return servers.reduce((prev, cur) =>
      prev.priority > cur.priority ? cur : prev,
    );
  };

  pr;
}
