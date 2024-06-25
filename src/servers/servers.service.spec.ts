import { Test } from '@nestjs/testing';
import { ServersService } from './servers.service';
import { HttpService } from '@nestjs/axios';
import { map, of, throwError, timer } from 'rxjs';
import { AxiosResponse } from 'axios';
import { ServersConfigService } from './servers-config.service';
import { Server } from './interfaces/server.interface';

describe('ServersService', () => {
  let service: ServersService;
  let httpService: HttpService;
  let serversConfigService: ServersConfigService;
  let servers: Server[];
  const timeoutThreshold = 200;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ServersService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: ServersConfigService,
          useValue: {
            getConfiguredServers: jest.fn(),
            getConfiguredTimeout: jest.fn(),
          },
        },
      ],
    }).compile();

    service = moduleRef.get<ServersService>(ServersService);
    httpService = moduleRef.get<HttpService>(HttpService);
    serversConfigService =
      moduleRef.get<ServersConfigService>(ServersConfigService);

    servers = generateServers();
    jest
      .spyOn(serversConfigService, 'getConfiguredServers')
      .mockImplementation(() => servers);

    jest
      .spyOn(serversConfigService, 'getConfiguredTimeout')
      .mockImplementation(() => timeoutThreshold);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the server with the lowest priority when all servers are online', async () => {
    jest.spyOn(httpService, 'get').mockImplementation(() =>
      of({
        status: 200,
      } as AxiosResponse),
    );

    const result = await service.findServer();

    expect(result).toEqual({
      url: 'https://does-not-work.perfume.new',
      priority: 1,
    });
  });

  it('should return the server with the lowest priority when all servers are online with different 2xx status', async () => {
    jest.spyOn(httpService, 'get').mockImplementation(() =>
      of({
        status: 299,
      } as AxiosResponse),
    );

    const result = await service.findServer();

    expect(result).toEqual({
      url: 'https://does-not-work.perfume.new',
      priority: 1,
    });
  });

  it('should return the server with the lowest priority when some servers are offline', async () => {
    jest.spyOn(httpService, 'get').mockImplementation((url) =>
      url === servers[0].url
        ? throwError(() => new Error())
        : of({
            status: 200,
          } as AxiosResponse),
    );

    const result = await service.findServer();

    expect(result).toEqual({
      url: 'https://offline.scentronix.com',
      priority: 2,
    });
  });

  it('should throw an error when no servers are online', async () => {
    jest
      .spyOn(httpService, 'get')
      .mockImplementation(() => throwError(() => new Error()));

    await expect(service.findServer()).rejects.toThrow('No servers available');
  });

  it('should throw an error when no servers are online with statuses that are considered offline', async () => {
    jest.spyOn(httpService, 'get').mockImplementation(() =>
      of({
        status: 301,
      } as AxiosResponse),
    );

    await expect(service.findServer()).rejects.toThrow('No servers available');
  });

  it(
    'should throw an error when all servers timeout',
    async () => {
      const mockResponse: AxiosResponse = {
        status: 200,
      } as AxiosResponse;

      jest
        .spyOn(httpService, 'get')
        .mockImplementation(() =>
          timer(timeoutThreshold + 1).pipe(map(() => mockResponse)),
        );

      await expect(service.findServer()).rejects.toThrow(
        'No servers available',
      );
    },
    timeoutThreshold + 100,
  );
});

const generateServers = (): Server[] => {
  return [
    {
      url: 'https://does-not-work.perfume.new',
      priority: 1,
    },
    {
      url: 'https://gitlab.com',
      priority: 4,
    },
    {
      url: 'http://app.scnt.me',
      priority: 3,
    },
    {
      url: 'https://offline.scentronix.com',
      priority: 2,
    },
  ];
};
