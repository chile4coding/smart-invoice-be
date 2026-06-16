// OpenAPI 3.0 spec. swagger-ui-express accepts a plain object so we avoid
// fighting openapi-types' strict $ref vs SchemaObject unions.

/* eslint-disable @typescript-eslint/no-explicit-any */
type Schema = Record<string, any>;
type Response = Record<string, any>;
/* eslint-enable @typescript-eslint/no-explicit-any */

// ─── Helper builders ─────────────────────────────────────────────────────────

const successBody = (dataSchema: Schema, message?: string): Schema => ({
  type: 'object',
  properties: {
    success: { type: 'boolean', example: true },
    data: dataSchema,
    ...(message ? { message: { type: 'string', example: message } } : {}),
  },
});

const paginatedBody = (itemSchema: Schema, itemKey: string): Schema => ({
  type: 'object',
  properties: {
    success: { type: 'boolean', example: true },
    data: {
      type: 'object',
      properties: {
        [itemKey]: { type: 'array', items: itemSchema },
        total: { type: 'integer', example: 42 },
        page: { type: 'integer', example: 1 },
        limit: { type: 'integer', example: 10 },
        totalPages: { type: 'integer', example: 5 },
      },
    },
  },
});

const errorBody = (code: string, message: string): Schema => ({
  type: 'object',
  properties: {
    success: { type: 'boolean', example: false },
    error: {
      type: 'object',
      properties: {
        code: { type: 'string', example: code },
        message: { type: 'string', example: message },
      },
    },
  },
});

const jsonContent = (schema: Schema): Record<string, Schema> => ({
  'application/json': { schema },
});

// ─── Shared responses ─────────────────────────────────────────────────────────

const unauthorizedResponse: Response = {
  description: 'Unauthorized – missing or invalid Bearer token',
  content: jsonContent(errorBody('UNAUTHORIZED', 'Invalid or expired token')),
};

const forbiddenResponse: Response = {
  description: 'Forbidden – insufficient role',
  content: jsonContent(errorBody('FORBIDDEN', 'You do not have permission to perform this action')),
};

const notFoundResponse: Response = {
  description: 'Resource not found',
  content: jsonContent(errorBody('NOT_FOUND', 'Resource not found')),
};

const validationErrorResponse: Response = {
  description: 'Validation error',
  content: jsonContent({
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      error: {
        type: 'object',
        properties: {
          code: { type: 'string', example: 'VALIDATION_ERROR' },
          message: { type: 'string', example: 'Validation failed' },
          details: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', example: 'clientEmail' },
                message: { type: 'string', example: 'Valid email is required' },
              },
            },
          },
        },
      },
    },
  }),
};

// ─── Component schemas ───────────────────────────────────────────────────────

const LineItemSchema: Schema = {
  type: 'object',
  required: ['description', 'quantity', 'unitPrice'],
  properties: {
    id: { type: 'string', format: 'uuid' },
    description: { type: 'string', example: 'Web development – 40 hrs' },
    quantity: { type: 'integer', minimum: 1, example: 40 },
    unitPrice: {
      type: 'integer',
      minimum: 0,
      description: 'Unit price in minor units (kobo/cents)',
      example: 500000,
    },
    total: { type: 'integer', readOnly: true, example: 20000000 },
    invoiceId: { type: 'string', format: 'uuid' },
  },
};

const InvoiceSchema: Schema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
    invoiceNumber: { type: 'string', example: 'INV-20240001' },
    status: { type: 'string', enum: ['DRAFT', 'SAVED', 'SENT'], example: 'DRAFT' },
    clientName: { type: 'string', example: 'Acme Corp Ltd' },
    clientEmail: { type: 'string', format: 'email', example: 'billing@acme.com' },
    clientAddress: { type: 'string', nullable: true, example: '12 Lagos Island, Lagos' },
    clientPhone: { type: 'string', nullable: true, example: '+2348012345678' },
    issueDate: { type: 'string', format: 'date-time', example: '2024-06-01T00:00:00.000Z' },
    dueDate: { type: 'string', format: 'date-time', example: '2024-06-30T00:00:00.000Z' },
    subtotal: { type: 'integer', description: 'Minor units (kobo/cents)', example: 20000000 },
    taxRate: { type: 'number', format: 'float', example: 7.5 },
    taxAmount: { type: 'integer', description: 'Minor units (kobo/cents)', example: 1500000 },
    discount: { type: 'integer', description: 'Minor units (kobo/cents)', example: 0 },
    grandTotal: { type: 'integer', description: 'Minor units (kobo/cents)', example: 21500000 },
    currency: { type: 'string', example: 'NGN' },
    notes: { type: 'string', nullable: true, example: 'Payment within 30 days' },
    createdById: { type: 'string', format: 'uuid' },
    lineItems: { type: 'array', items: { $ref: '#/components/schemas/LineItem' } },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const UserSchema: Schema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid', example: 'f1e2d3c4-b5a6-7890-abcd-ef1234567890' },
    email: { type: 'string', format: 'email', example: 'john@example.com' },
    firstName: { type: 'string', example: 'John' },
    lastName: { type: 'string', example: 'Doe' },
    role: { type: 'string', enum: ['SUPER_ADMIN', 'ADMIN', 'USER'], example: 'USER' },
    isActive: { type: 'boolean', example: true },
    createdById: { type: 'string', format: 'uuid', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const DashboardStatsSchema: Schema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    userId: { type: 'string', format: 'uuid' },
    totalAttendance: { type: 'string', example: '120' },
    newRegistration: { type: 'string', example: '15' },
    followUp: { type: 'string', example: '30' },
    totalPatients: { type: 'string', example: '200' },
    today: { type: 'string', example: '10' },
    thisWeek: { type: 'string', example: '45' },
    thisMonth: { type: 'string', example: '180' },
    totalPayments: { type: 'string', example: '500000' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const DepartmentSchema: Schema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    externalId: { type: 'string', example: '75' },
    name: { type: 'string', example: 'ANNEX STORE' },
    hcode: { type: 'string', example: '1' },
    dtype: { type: 'string', enum: ['clinic', 'department'], example: 'department' },
    isActive: { type: 'boolean', example: true },
    deptGroup: { type: 'string', nullable: true, example: 'PHARMACY' },
    recno: { type: 'string', nullable: true, example: '75' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const DepartmentFeeSchema: Schema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    billname: { type: 'string', example: 'VIP ADMISSION DEPOSIT (SMALL ROOM)' },
    billcost: { type: 'string', nullable: true, example: '386700' },
    status: { type: 'string', nullable: true, example: '1' },
    nfPrice: { type: 'string', nullable: true, example: '0' },
    hmoFees: { type: 'string', nullable: true, example: '' },
    sno: { type: 'string', nullable: true, example: '323' },
    externalId: { type: 'string', example: '386700:323:VIP ADMISSION DEPOSIT (SMALL ROOM):0:VIP:VIP1' },
    departmentId: { type: 'string', format: 'uuid' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const InvoiceBodySchema: Schema = {
  type: 'object',
  required: ['clientName', 'clientEmail', 'issueDate', 'dueDate', 'lineItems'],
  properties: {
    clientName: { type: 'string', example: 'Acme Corp Ltd' },
    clientEmail: { type: 'string', format: 'email', example: 'billing@acme.com' },
    clientAddress: { type: 'string', example: '12 Lagos Island, Lagos' },
    clientPhone: { type: 'string', example: '+2348012345678' },
    issueDate: { type: 'string', format: 'date', example: '2024-06-01' },
    dueDate: { type: 'string', format: 'date', example: '2024-06-30' },
    taxRate: {
      type: 'number',
      format: 'float',
      minimum: 0,
      maximum: 100,
      example: 7.5,
      description: 'Percentage (0–100)',
    },
    discount: {
      type: 'integer',
      minimum: 0,
      description: 'Discount in minor units (kobo/cents)',
      example: 50000,
    },
    currency: { type: 'string', minLength: 3, maxLength: 3, example: 'NGN' },
    notes: { type: 'string', example: 'Payment within 30 days' },
    lineItems: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['description', 'quantity', 'unitPrice'],
        properties: {
          description: { type: 'string', example: 'Web development – 40 hrs' },
          quantity: { type: 'integer', minimum: 1, example: 40 },
          unitPrice: {
            type: 'integer',
            minimum: 0,
            description: 'Minor units (kobo/cents)',
            example: 500000,
          },
        },
      },
    },
  },
};

// ─── Path parameters ──────────────────────────────────────────────────────────

const idParam = {
  name: 'id',
  in: 'path',
  required: true,
  schema: { type: 'string', format: 'uuid' },
};

// ─── Full spec ────────────────────────────────────────────────────────────────

const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Smart Invoicer API',
    version: '1.0.0',
    description: [
      'Multi-role Invoice Management Platform.',
      '',
      '**Monetary values** — `unitPrice`, `subtotal`, `taxAmount`, `discount`, and `grandTotal`',
      'are all stored as **integers in minor units** (kobo for NGN, cents for USD, etc.).',
      'Divide by 100 to display as major currency.',
      '',
      '**Tax rate** — `taxRate` is a percentage float between 0 and 100.',
    ].join('\n'),
    contact: { email: 'support@excellentbridge.com' },
  },
  servers: [{ url: 'http://localhost:3000', description: 'Local development' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: { LineItem: LineItemSchema, Invoice: InvoiceSchema, User: UserSchema, InvoiceBody: InvoiceBodySchema, DashboardStats: DashboardStatsSchema, Department: DepartmentSchema, DepartmentFee: DepartmentFeeSchema },
  },
  paths: {
    // ── Health ────────────────────────────────────────────────────────────────
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: {
          '200': {
            description: 'Service is healthy',
            content: jsonContent({
              type: 'object',
              properties: {
                status: { type: 'string', example: 'ok' },
                timestamp: { type: 'string', format: 'date-time' },
              },
            }),
          },
        },
      },
    },

    // ── Auth ──────────────────────────────────────────────────────────────────
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login',
        description: 'Returns a JWT access token. Rate-limited to **10 requests per 15 minutes**.',
        requestBody: {
          required: true,
          content: jsonContent({
            type: 'object',
            required: ['email', 'password'],
            properties: {
              email: { type: 'string', format: 'email', example: 'admin@example.com' },
              password: { type: 'string', example: 'Secret123!' },
            },
          }),
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: jsonContent(
              successBody(
                {
                  type: 'object',
                  properties: {
                    accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
                'Login successful'
              )
            ),
          },
          '401': {
            description: 'Invalid credentials',
            content: jsonContent(errorBody('UNAUTHORIZED', 'Invalid email or password')),
          },
          '422': validationErrorResponse,
        },
      },
    },

    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout',
        description: 'Clears the session. The client should discard the token.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Logged out',
            content: jsonContent(successBody({ type: 'object', nullable: true, example: null }, 'Logged out successfully')),
          },
          '401': unauthorizedResponse,
        },
      },
    },

    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user',
        description: "Returns the authenticated user's profile.",
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Current user',
            content: jsonContent(successBody({ $ref: '#/components/schemas/User' })),
          },
          '401': unauthorizedResponse,
          '404': notFoundResponse,
        },
      },
    },

    // ── Dashboard Stats ───────────────────────────────────────────────────────
    '/api/users/dashboard-stats': {
      post: {
        tags: ['Users'],
        summary: 'Upsert dashboard stats',
        description: 'Creates or updates the dashboard stats record for the authenticated user.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: jsonContent({
            type: 'object',
            required: ['totalAttendance', 'newRegistration', 'followUp', 'totalPatients', 'today', 'thisWeek', 'thisMonth', 'totalPayments'],
            properties: {
              totalAttendance: { type: 'string', example: '120' },
              newRegistration: { type: 'string', example: '15' },
              followUp: { type: 'string', example: '30' },
              totalPatients: { type: 'string', example: '200' },
              today: { type: 'string', example: '10' },
              thisWeek: { type: 'string', example: '45' },
              thisMonth: { type: 'string', example: '180' },
              totalPayments: { type: 'string', example: '500000' },
            },
          }),
        },
        responses: {
          '200': {
            description: 'Dashboard stats saved',
            content: jsonContent(successBody({ $ref: '#/components/schemas/DashboardStats' }, 'Dashboard stats saved successfully')),
          },
          '401': unauthorizedResponse,
          '422': validationErrorResponse,
        },
      },
      get: {
        tags: ['Users'],
        summary: 'Get dashboard stats',
        description: 'Returns the dashboard stats record for the authenticated user.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Dashboard stats',
            content: jsonContent(successBody({ $ref: '#/components/schemas/DashboardStats' })),
          },
          '401': unauthorizedResponse,
          '404': notFoundResponse,
        },
      },
    },

    // ── Users ─────────────────────────────────────────────────────────────────
    '/api/users': {
      post: {
        tags: ['Users'],
        summary: 'Create user',
        description: '**SUPER_ADMIN only.** Creates a new ADMIN or USER account.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: jsonContent({
            type: 'object',
            required: ['firstName', 'lastName', 'email', 'password', 'role'],
            properties: {
              firstName: { type: 'string', example: 'Jane' },
              lastName: { type: 'string', example: 'Smith' },
              email: { type: 'string', format: 'email', example: 'jane@example.com' },
              password: { type: 'string', minLength: 8, example: 'Str0ngP@ss' },
              role: { type: 'string', enum: ['ADMIN', 'USER'], example: 'ADMIN' },
            },
          }),
        },
        responses: {
          '201': {
            description: 'User created',
            content: jsonContent(successBody({ $ref: '#/components/schemas/User' }, 'User created successfully')),
          },
          '401': unauthorizedResponse,
          '403': forbiddenResponse,
          '422': validationErrorResponse,
        },
      },
      get: {
        tags: ['Users'],
        summary: 'List users',
        description: '**SUPER_ADMIN only.** Paginated list with optional search.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Filter by name or email' },
        ],
        responses: {
          '200': {
            description: 'Paginated users',
            content: jsonContent(paginatedBody({ $ref: '#/components/schemas/User' }, 'users')),
          },
          '401': unauthorizedResponse,
          '403': forbiddenResponse,
        },
      },
    },

    '/api/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get user by ID',
        description: '**SUPER_ADMIN only.**',
        security: [{ bearerAuth: [] }],
        parameters: [idParam],
        responses: {
          '200': {
            description: 'User details',
            content: jsonContent(successBody({ $ref: '#/components/schemas/User' })),
          },
          '401': unauthorizedResponse,
          '403': forbiddenResponse,
          '404': notFoundResponse,
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Deactivate user',
        description: '**SUPER_ADMIN only.** Sets `isActive` to false.',
        security: [{ bearerAuth: [] }],
        parameters: [idParam],
        responses: {
          '204': { description: 'User deactivated – no content' },
          '401': unauthorizedResponse,
          '403': forbiddenResponse,
          '404': notFoundResponse,
        },
      },
    },

    '/api/users/{id}/profile': {
      patch: {
        tags: ['Users'],
        summary: 'Update user profile',
        description: 'Updates the `firstName` and `lastName` of a user. Any authenticated user can update a profile.',
        security: [{ bearerAuth: [] }],
        parameters: [idParam],
        requestBody: {
          required: true,
          content: jsonContent({
            type: 'object',
            required: ['firstName', 'lastName'],
            properties: {
              firstName: { type: 'string', example: 'Jane' },
              lastName: { type: 'string', example: 'Smith' },
            },
          }),
        },
        responses: {
          '200': {
            description: 'Profile updated',
            content: jsonContent(successBody({ $ref: '#/components/schemas/User' }, 'Profile updated successfully')),
          },
          '401': unauthorizedResponse,
          '404': notFoundResponse,
          '422': validationErrorResponse,
        },
      },
    },

    '/api/users/{id}/password': {
      patch: {
        tags: ['Users'],
        summary: 'Change user password',
        description: '**SUPER_ADMIN only.**',
        security: [{ bearerAuth: [] }],
        parameters: [idParam],
        requestBody: {
          required: true,
          content: jsonContent({
            type: 'object',
            required: ['newPassword'],
            properties: {
              newPassword: { type: 'string', minLength: 8, example: 'NewStr0ng@Pass' },
            },
          }),
        },
        responses: {
          '200': {
            description: 'Password updated',
            content: jsonContent(successBody({ $ref: '#/components/schemas/User' }, 'Password updated successfully')),
          },
          '401': unauthorizedResponse,
          '403': forbiddenResponse,
          '404': notFoundResponse,
          '422': validationErrorResponse,
        },
      },
    },

    '/api/users/{id}/role': {
      patch: {
        tags: ['Users'],
        summary: 'Change user role',
        description: '**SUPER_ADMIN only.**',
        security: [{ bearerAuth: [] }],
        parameters: [idParam],
        requestBody: {
          required: true,
          content: jsonContent({
            type: 'object',
            required: ['role'],
            properties: {
              role: { type: 'string', enum: ['SUPER_ADMIN', 'ADMIN', 'USER'], example: 'ADMIN' },
            },
          }),
        },
        responses: {
          '200': {
            description: 'Role updated',
            content: jsonContent(successBody({ $ref: '#/components/schemas/User' }, 'Role updated successfully')),
          },
          '401': unauthorizedResponse,
          '403': forbiddenResponse,
          '404': notFoundResponse,
          '422': validationErrorResponse,
        },
      },
    },

    // ── Invoices ──────────────────────────────────────────────────────────────
    '/api/invoices': {
      post: {
        tags: ['Invoices'],
        summary: 'Create invoice',
        description: '**SUPER_ADMIN / ADMIN only.** All prices must be in minor units (kobo/cents).',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/InvoiceBody' },
              example: {
                clientName: 'Acme Corp Ltd',
                clientEmail: 'billing@acme.com',
                clientAddress: '12 Lagos Island, Lagos',
                clientPhone: '+2348012345678',
                issueDate: '2024-06-01',
                dueDate: '2024-06-30',
                taxRate: 7.5,
                discount: 0,
                currency: 'NGN',
                notes: 'Payment within 30 days',
                lineItems: [
                  { description: 'Web development – 40 hrs', quantity: 40, unitPrice: 500000 },
                  { description: 'UI/UX design', quantity: 1, unitPrice: 3000000 },
                ],
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Invoice created',
            content: jsonContent(successBody({ $ref: '#/components/schemas/Invoice' }, 'Invoice created successfully')),
          },
          '401': unauthorizedResponse,
          '403': forbiddenResponse,
          '422': validationErrorResponse,
        },
      },
      get: {
        tags: ['Invoices'],
        summary: 'List invoices',
        description: 'Paginated + filterable list. Admins see all; regular users see only their own.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['DRAFT', 'SAVED', 'SENT'] } },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Invoice number, client name, or email' },
          { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Issue date from (inclusive)' },
          { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Issue date to (inclusive)' },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['createdAt', 'issueDate', 'dueDate', 'grandTotal'], default: 'createdAt' } },
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
        ],
        responses: {
          '200': {
            description: 'Paginated invoices',
            content: jsonContent(paginatedBody({ $ref: '#/components/schemas/Invoice' }, 'invoices')),
          },
          '401': unauthorizedResponse,
        },
      },
    },

    '/api/invoices/{id}': {
      get: {
        tags: ['Invoices'],
        summary: 'Get invoice by ID',
        security: [{ bearerAuth: [] }],
        parameters: [idParam],
        responses: {
          '200': {
            description: 'Invoice details',
            content: jsonContent(successBody({ $ref: '#/components/schemas/Invoice' })),
          },
          '401': unauthorizedResponse,
          '404': notFoundResponse,
        },
      },
      put: {
        tags: ['Invoices'],
        summary: 'Update invoice',
        description: '**SUPER_ADMIN / ADMIN only.** Replaces all fields and recreates line items.',
        security: [{ bearerAuth: [] }],
        parameters: [idParam],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/InvoiceBody' },
              example: {
                clientName: 'Acme Corp Ltd',
                clientEmail: 'billing@acme.com',
                issueDate: '2024-06-01',
                dueDate: '2024-06-30',
                taxRate: 10,
                discount: 100000,
                currency: 'NGN',
                lineItems: [{ description: 'Updated consulting service', quantity: 1, unitPrice: 8000000 }],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Invoice updated',
            content: jsonContent(successBody({ $ref: '#/components/schemas/Invoice' }, 'Invoice updated successfully')),
          },
          '401': unauthorizedResponse,
          '403': forbiddenResponse,
          '404': notFoundResponse,
          '422': validationErrorResponse,
        },
      },
      delete: {
        tags: ['Invoices'],
        summary: 'Delete invoice',
        description: '**SUPER_ADMIN / ADMIN only.**',
        security: [{ bearerAuth: [] }],
        parameters: [idParam],
        responses: {
          '204': { description: 'Invoice deleted – no content' },
          '401': unauthorizedResponse,
          '403': forbiddenResponse,
          '404': notFoundResponse,
        },
      },
    },

    '/api/invoices/{id}/status': {
      patch: {
        tags: ['Invoices'],
        summary: 'Update invoice status',
        description: '**SUPER_ADMIN / ADMIN only.**',
        security: [{ bearerAuth: [] }],
        parameters: [idParam],
        requestBody: {
          required: true,
          content: jsonContent({
            type: 'object',
            required: ['status'],
            properties: {
              status: { type: 'string', enum: ['DRAFT', 'SAVED', 'SENT'], example: 'SENT' },
            },
          }),
        },
        responses: {
          '200': {
            description: 'Status updated',
            content: jsonContent(successBody({ $ref: '#/components/schemas/Invoice' }, 'Invoice status updated')),
          },
          '401': unauthorizedResponse,
          '403': forbiddenResponse,
          '404': notFoundResponse,
          '422': validationErrorResponse,
        },
      },
    },

    '/api/invoices/{id}/preview': {
      get: {
        tags: ['Invoices'],
        summary: 'Preview invoice as HTML',
        description: '**SUPER_ADMIN / ADMIN only.** Returns a rendered HTML page.',
        security: [{ bearerAuth: [] }],
        parameters: [idParam],
        responses: {
          '200': {
            description: 'HTML preview',
            content: { 'text/html': { schema: { type: 'string' } } },
          },
          '401': unauthorizedResponse,
          '403': forbiddenResponse,
          '404': notFoundResponse,
        },
      },
    },

    // ── Departments ───────────────────────────────────────────────────────────
    '/api/departments': {
      get: {
        tags: ['Departments'],
        summary: 'List departments',
        description: '**SUPER_ADMIN / ADMIN only.** Paginated list of all departments with optional name search.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Filter by department name (case-insensitive)' },
        ],
        responses: {
          '200': {
            description: 'Paginated departments',
            content: jsonContent(paginatedBody({ $ref: '#/components/schemas/Department' }, 'departments')),
          },
          '401': unauthorizedResponse,
          '403': forbiddenResponse,
        },
      },
    },

    '/api/departments/{identifier}/fees': {
      get: {
        tags: ['Departments'],
        summary: 'List department fees',
        description: [
          '**SUPER_ADMIN / ADMIN only.**',
          'Fetches paginated fees for a department.',
          'The `identifier` path parameter accepts any of:',
          '- Internal UUID (`id`)',
          '- External source ID (`externalId`)',
          '- Department name (case-insensitive)',
        ].join('\n'),
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'identifier',
            in: 'path',
            required: true,
            description: 'Department UUID, externalId, or name',
            schema: { type: 'string', example: 'ANNEX STORE' },
          },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Filter fees by bill name (case-insensitive)' },
        ],
        responses: {
          '200': {
            description: 'Paginated department fees',
            content: jsonContent({
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                data: {
                  type: 'object',
                  properties: {
                    department: { $ref: '#/components/schemas/Department' },
                    fees: { type: 'array', items: { $ref: '#/components/schemas/DepartmentFee' } },
                    total: { type: 'integer', example: 42 },
                    page: { type: 'integer', example: 1 },
                    limit: { type: 'integer', example: 10 },
                    totalPages: { type: 'integer', example: 5 },
                  },
                },
              },
            }),
          },
          '401': unauthorizedResponse,
          '403': forbiddenResponse,
          '404': notFoundResponse,
        },
      },
    },

    '/api/invoices/{id}/pdf': {
      get: {
        tags: ['Invoices'],
        summary: 'Download invoice as PDF',
        description: '**SUPER_ADMIN / ADMIN only.** Streams a PDF file.',
        security: [{ bearerAuth: [] }],
        parameters: [idParam],
        responses: {
          '200': {
            description: 'PDF binary',
            content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } } },
          },
          '401': unauthorizedResponse,
          '403': forbiddenResponse,
          '404': notFoundResponse,
        },
      },
    },
  },
};

export default swaggerSpec;
