import { HttpModuleOptions, HttpModuleOptionsFactory } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HttpConfigService implements HttpModuleOptionsFactory {
  constructor(private configService: ConfigService) {}

  createHttpOptions(): HttpModuleOptions {
    return {
      timeout: this.configService.get('HTTP_TIMEOUT'),
      maxRedirects: this.configService.get('HTTP_MAX_REDIRECTS'),
    };
  }
}
