"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const nestjs_pino_1 = require("nestjs-pino");
const path_1 = require("path");
const app_module_1 = require("./app.module");
const swagger_config_1 = require("./common/swagger/swagger.config");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { bufferLogs: true });
    app.useLogger(app.get(nestjs_pino_1.Logger));
    app.useStaticAssets((0, path_1.join)(process.cwd(), 'uploads'), { prefix: '/uploads/' });
    app.setGlobalPrefix('api/v1');
    app.enableCors({
        origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
        credentials: true,
        exposedHeaders: ['X-Request-Id'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const document = swagger_1.SwaggerModule.createDocument(app, (0, swagger_config_1.buildSwaggerDocument)());
    swagger_1.SwaggerModule.setup('docs', app, document, swagger_config_1.swaggerCustomOptions);
    const port = process.env.API_PORT ?? 3001;
    await app.listen(port);
    const logger = app.get(nestjs_pino_1.Logger);
    logger.log(`Electromon API running on http://localhost:${port}`);
    logger.log(`Swagger docs at http://localhost:${port}/docs`);
    logger.log(`Metrics at http://localhost:${port}/api/v1/metrics`);
}
bootstrap();
//# sourceMappingURL=main.js.map