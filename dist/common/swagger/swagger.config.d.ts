import { SwaggerCustomOptions } from '@nestjs/swagger';
export declare const SWAGGER_BEARER_AUTH = "access-token";
export declare function buildSwaggerDocument(): Omit<import("@nestjs/swagger").OpenAPIObject, "paths">;
export declare const swaggerCustomOptions: SwaggerCustomOptions;
