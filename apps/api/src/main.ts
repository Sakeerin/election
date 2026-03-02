import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
/* eslint-disable @typescript-eslint/no-var-requires */
const compression = require('compression');
const helmet = require('helmet');

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT', 4000);
    const corsOrigins = configService.get<string>('CORS_ORIGINS', 'http://localhost:3000');

    // Security
    app.use(helmet());
    app.use(compression());

    // CORS
    app.enableCors({
        origin: corsOrigins.split(','),
        credentials: true,
    });

    // Validation
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    // API Prefix
    app.setGlobalPrefix('api');

    // Swagger Documentation
    const swaggerConfig = new DocumentBuilder()
        .setTitle('Election Reporting API')
        .setDescription('Thai Election Reporting System API - ระบบรายงานผลการเลือกตั้ง')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);

    await app.listen(port);
    console.log(`🗳️  Election API running on http://localhost:${port}`);
    console.log(`📖  Swagger docs at http://localhost:${port}/api/docs`);
}
bootstrap();
