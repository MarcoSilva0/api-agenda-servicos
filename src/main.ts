import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  app.useStaticAssets(join(__dirname, '..', 'public'));
  
  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({ 
    origin: ['http://localhost:3000', 'http://localhost:3001'], 
    credentials: true 
  });

  const config = new DocumentBuilder()
    .setTitle('API Agenda de Serviços')
    .setDescription('Sistema de gerenciamento para pequenos negócios - IFSP Campus Barretos')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    jsonDocumentUrl: 'swagger/json',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();