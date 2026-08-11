import { DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger';

export const SWAGGER_BEARER_AUTH = 'access-token';

export function buildSwaggerDocument() {
  return new DocumentBuilder()
    .setTitle('Dan-Modi API')
    .setDescription(
      [
        '**Dan-Modi** — Campaign command & real-time result monitoring.',
        '',
        'REST API for campaign operations: authentication, geographic structure,',
        'support groups, volunteers, field reporting, and election-day collation.',
        '',
        '### Authentication',
        '1. Call `POST /auth/login` with phone number and password',
        '2. Copy the `accessToken` from the response',
        '3. Click **Authorize** above and paste: `Bearer <accessToken>`',
      ].join('\n'),
    )
    .setVersion('0.1.0')
    .setContact('Dan-Modi Campaign', '', 'support@electromon.ng')
    .addServer('http://localhost:3001', 'Local development')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT access token from POST /auth/login',
      },
      SWAGGER_BEARER_AUTH,
    )
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

export const swaggerCustomOptions: SwaggerCustomOptions = {
  swaggerOptions: {
    persistAuthorization: true,
    tagsSorter: 'alpha',
    operationsSorter: 'method',
    docExpansion: 'none',
    filter: true,
    showRequestDuration: true,
  },
  customSiteTitle: 'Dan-Modi API Docs',
  customfavIcon: '/favicon.ico',
  jsonDocumentUrl: 'docs/json',
};
