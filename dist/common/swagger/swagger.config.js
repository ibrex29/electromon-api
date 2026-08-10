"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerCustomOptions = exports.SWAGGER_BEARER_AUTH = void 0;
exports.buildSwaggerDocument = buildSwaggerDocument;
const swagger_1 = require("@nestjs/swagger");
exports.SWAGGER_BEARER_AUTH = 'access-token';
function buildSwaggerDocument() {
    return new swagger_1.DocumentBuilder()
        .setTitle('Electromon API')
        .setDescription([
        '**Electromon** — Campaign Management & Election Intelligence Platform.',
        '',
        'REST API for managing Nigerian political campaigns: authentication,',
        'geographic structure, support groups, volunteers, field reporting,',
        'and election-day operations.',
        '',
        '### Authentication',
        '1. Call `POST /auth/login` with email and password',
        '2. Copy the `accessToken` from the response',
        '3. Click **Authorize** above and paste: `Bearer <accessToken>`',
    ].join('\n'))
        .setVersion('0.1.0')
        .setContact('Electromon Team', 'https://electromon.ng', 'support@electromon.ng')
        .addServer('http://localhost:3001', 'Local development')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT access token from POST /auth/login',
    }, exports.SWAGGER_BEARER_AUTH)
        .addTag('analytics', 'Campaign KPIs & performance rankings')
        .addTag('situation-room', 'Election day command dashboard')
        .addTag('field-reports', 'Field reporting from volunteers & agents')
        .addTag('polling-units', 'Polling unit intelligence & agent assignment')
        .addTag('volunteers', 'Volunteer registration & management')
        .addTag('commitments', 'Support group commitments & progress targets')
        .addTag('support-groups', 'Support group registration & management')
        .addTag('health', 'Health checks & monitoring')
        .addTag('auth', 'Authentication & session management')
        .addTag('campaigns', 'Campaign management')
        .addTag('structure', 'Geographic hierarchy — State → LGA → Ward → Polling Unit')
        .build();
}
exports.swaggerCustomOptions = {
    swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'method',
        docExpansion: 'none',
        filter: true,
        showRequestDuration: true,
    },
    customSiteTitle: 'Electromon API Docs',
    customfavIcon: '/favicon.ico',
    jsonDocumentUrl: 'docs/json',
};
//# sourceMappingURL=swagger.config.js.map