import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getHealth() {
    return {
      status: 'ok',
      message: 'API Agenda de Serviços está funcionando!',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      endpoints: {
        documentation: '/',
        swagger: '/api',
        health: '/health',
      },
      features: {
        authentication: true,
        swagger: true,
        validation: true,
        cors: true,
      }
    };
  }
}
