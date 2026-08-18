import { DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger';

export const SWAGGER_BEARER_AUTH = 'access-token';

export function buildSwaggerDocument(extraServers: Array<{ url: string; description: string }> = []) {
  const builder = new DocumentBuilder()
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
        '',
        '### Mobile PU agent (EC8A)',
        'Base path is `/api/v1`. Demo password: `ChangeMe123!` (e.g. `+2348000000002`).',
        '1. `POST /auth/login` `{ phoneNumber, password }`',
        '2. `GET /collation/dashboard` — assigned PU + current draft',
        '3. `POST /collation/ec8a/scan-file` — multipart field `file` (JPEG/PNG, max 5 MB)',
        '4. Show returned `fields` + `partyResults`; agent edits if needed',
        '5. `POST /collation/results` — save draft (include `ec8aPhotoUrls: [photoUrl]`)',
        '6. `PATCH /collation/results/:id/submit`',
        '',
        'OpenAPI JSON: `/docs/json`',
      ].join('\n'),
    )
    .setVersion('0.1.0')
    .setContact('Dan-Modi Campaign', '', 'support@electromon.ng')
    .addServer('http://localhost:3001', 'Local development')
    .addServer('https://api.electromon.iexportcalc.com', 'Production')
    .addServer(
      'https://electromon-backend-4cnjmz-595e23-161-97-113-136.traefik.me',
      'Dokploy (Traefik)',
    );

  for (const server of extraServers) {
    builder.addServer(server.url, server.description);
  }

  return builder
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT access token from POST /auth/login',
      },
      SWAGGER_BEARER_AUTH,
    )
    .addTag('mobile', 'PU agent app — login, EC8A scan, draft, submit')
    .addTag('collation', 'Election-day result entry, OCR, and review')
    .addTag('uploads', 'Photo / document upload')
    .addTag('agents', 'Ward & PU agent account management (LGA)')
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
