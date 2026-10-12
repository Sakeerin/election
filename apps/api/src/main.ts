import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
/* eslint-disable @typescript-eslint/no-var-requires */
const compression = require('compression');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const logger = new Logger('Bootstrap');

    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT', 4000);
    const corsOrigins = configService.get<string>('CORS_ORIGINS', 'http://localhost:3000');
    const cookieSecret = configService.get<string>('COOKIE_SECRET');

    // Security
    app.use(helmet());
    app.use(compression());

    // Cookie parser (must be before CORS and routes)
    app.use(cookieParser(cookieSecret));

    // Request correlation ID
    app.use(RequestIdMiddleware);

    // CORS
    app.enableCors({
        origin: corsOrigins.split(',').map((o) => o.trim()),
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
    logger.log(`Election API running on http://localhost:${port}`);
    logger.log(`Swagger docs at http://localhost:${port}/api/docs`);
}
bootstrap();
