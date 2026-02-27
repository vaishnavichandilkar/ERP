import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/exceptions/global-exception.filter';

(BigInt.prototype as any).toJSON = function () {
    return this.toString();
};

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Global Config
    app.setGlobalPrefix('api/v1');
    app.enableCors();

    // Validation
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));

    // Exception Filter
    app.useGlobalFilters(new GlobalExceptionFilter());

    // Swagger
    setupSwagger(app);

    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
    console.log(`Swagger Docs available at: http://localhost:${port}${process.env.SWAGGER_PATH || '/api/docs'}`);
}
bootstrap();
