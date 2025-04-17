import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'NearMart',
            version: '1.0.0',
            description: 'API for NearMart - Your Local Department Store Platform',
        },
        servers: [
            {
                url: process.env.API_URL || 'http://localhost:3001',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                StoreTiming: {
                    type: 'object',
                    properties: {
                        day: {
                            type: 'string',
                            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
                        },
                        open: {
                            type: 'string',
                            format: 'time',
                        },
                        close: {
                            type: 'string',
                            format: 'time',
                        },
                        isClosed: {
                            type: 'boolean',
                        },
                    },
                },
                TicketMessage: {
                    type: 'object',
                    properties: {
                        senderId: {
                            type: 'string',
                            description: 'ID of the message sender'
                        },
                        senderType: {
                            type: 'string',
                            enum: ['Customer', 'Retailer', 'Support'],
                            description: 'Type of the sender'
                        },
                        message: {
                            type: 'string',
                            description: 'Message content'
                        },
                        attachments: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    type: { type: 'string' },
                                    url: { type: 'string' }
                                }
                            }
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                },
                SupportTicket: {
                    type: 'object',
                    properties: {
                        customerId: {
                            type: 'string',
                            description: 'ID of the customer who created the ticket'
                        },
                        retailerId: {
                            type: 'string',
                            description: 'ID of the retailer if ticket is related to a store'
                        },
                        orderId: {
                            type: 'string',
                            description: 'ID of the order if ticket is related to an order'
                        },
                        subject: {
                            type: 'string',
                            description: 'Ticket subject'
                        },
                        category: {
                            type: 'string',
                            enum: ['order', 'payment', 'delivery', 'product', 'account', 'other'],
                            description: 'Ticket category'
                        },
                        priority: {
                            type: 'string',
                            enum: ['low', 'medium', 'high', 'urgent'],
                            description: 'Ticket priority'
                        },
                        status: {
                            type: 'string',
                            enum: ['open', 'in_progress', 'resolved', 'closed'],
                            description: 'Current ticket status'
                        },
                        messages: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/TicketMessage'
                            }
                        },
                        resolution: {
                            type: 'string',
                            description: 'Resolution details when ticket is resolved'
                        },
                        customerSatisfaction: {
                            type: 'object',
                            properties: {
                                rating: {
                                    type: 'number',
                                    minimum: 1,
                                    maximum: 5
                                },
                                feedback: {
                                    type: 'string'
                                }
                            }
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                }
            },
        },
    },
    apis: ['./src/routes/*.js'], // Path to the API routes
};

const specs = swaggerJsdoc(options);

// Add retailer endpoints documentation
specs.paths['/api/retailers/search'] = {
    get: {
        tags: ['Retailers'],
        summary: 'Search retailers',
        description: 'Search retailers based on various criteria like name, type, location, and rating',
        parameters: [
            {
                name: 'query',
                in: 'query',
                description: 'Search query for business name or description',
                schema: { type: 'string' },
            },
            {
                name: 'type',
                in: 'query',
                description: 'Business type filter',
                schema: { type: 'string' },
            },
            {
                name: 'location',
                in: 'query',
                description: 'Location filter (city)',
                schema: { type: 'string' },
            },
            {
                name: 'rating',
                in: 'query',
                description: 'Minimum rating filter',
                schema: { type: 'number' },
            },
            {
                name: 'sortBy',
                in: 'query',
                description: 'Sort by field (rating, orders, newest)',
                schema: { type: 'string', enum: ['rating', 'orders', 'newest'] },
            },
            {
                name: 'page',
                in: 'query',
                description: 'Page number',
                schema: { type: 'integer', default: 1 },
            },
            {
                name: 'limit',
                in: 'query',
                description: 'Items per page',
                schema: { type: 'integer', default: 10 },
            },
        ],
        responses: {
            200: {
                description: 'List of retailers matching the search criteria',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                retailers: {
                                    type: 'array',
                                    items: {
                                        $ref: '#/components/schemas/Retailer',
                                    },
                                },
                                page: { type: 'integer' },
                                totalPages: { type: 'integer' },
                                total: { type: 'integer' },
                            },
                        },
                    },
                },
            },
        },
    },
};

specs.paths['/api/retailers/{retailerId}/reviews'] = {
    get: {
        tags: ['Retailers'],
        summary: 'Get retailer reviews',
        description: 'Get reviews for a specific retailer',
        parameters: [
            {
                name: 'retailerId',
                in: 'path',
                required: true,
                description: 'ID of the retailer',
                schema: { type: 'string' },
            },
            {
                name: 'page',
                in: 'query',
                description: 'Page number',
                schema: { type: 'integer', default: 1 },
            },
            {
                name: 'limit',
                in: 'query',
                description: 'Items per page',
                schema: { type: 'integer', default: 10 },
            },
            {
                name: 'sort',
                in: 'query',
                description: 'Sort by field (recent, rating, likes)',
                schema: { type: 'string', enum: ['recent', 'rating', 'likes'] },
            },
        ],
        responses: {
            200: {
                description: 'List of reviews for the retailer',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                reviews: {
                                    type: 'array',
                                    items: {
                                        $ref: '#/components/schemas/Review',
                                    },
                                },
                                page: { type: 'integer' },
                                totalPages: { type: 'integer' },
                                total: { type: 'integer' },
                            },
                        },
                    },
                },
            },
        },
    },
    post: {
        tags: ['Retailers'],
        summary: 'Add a review',
        description: 'Add a review for a retailer (requires authentication)',
        security: [{ bearerAuth: [] }],
        parameters: [
            {
                name: 'retailerId',
                in: 'path',
                required: true,
                description: 'ID of the retailer',
                schema: { type: 'string' },
            },
        ],
        requestBody: {
            required: true,
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        required: ['rating', 'comment'],
                        properties: {
                            rating: {
                                type: 'number',
                                minimum: 1,
                                maximum: 5,
                                description: 'Rating from 1 to 5',
                            },
                            comment: {
                                type: 'string',
                                description: 'Review comment',
                            },
                            images: {
                                type: 'array',
                                items: { type: 'string' },
                                description: 'Array of image URLs',
                            },
                        },
                    },
                },
            },
        },
        responses: {
            201: {
                description: 'Review created successfully',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/Review',
                        },
                    },
                },
            },
            403: {
                description: 'User has not ordered from this retailer',
            },
        },
    },
};

specs.paths['/api/retailers/store-timings'] = {
    put: {
        tags: ['Retailers'],
        summary: 'Update store timings',
        description: 'Update store opening and closing times (retailer only)',
        security: [{ bearerAuth: [] }],
        requestBody: {
            required: true,
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            storeTimings: {
                                type: 'object',
                                properties: {
                                    monday: { $ref: '#/components/schemas/StoreTiming' },
                                    tuesday: { $ref: '#/components/schemas/StoreTiming' },
                                    wednesday: { $ref: '#/components/schemas/StoreTiming' },
                                    thursday: { $ref: '#/components/schemas/StoreTiming' },
                                    friday: { $ref: '#/components/schemas/StoreTiming' },
                                    saturday: { $ref: '#/components/schemas/StoreTiming' },
                                    sunday: { $ref: '#/components/schemas/StoreTiming' },
                                },
                            },
                        },
                    },
                },
            },
        },
        responses: {
            200: {
                description: 'Store timings updated successfully',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                storeTimings: {
                                    type: 'object',
                                    properties: {
                                        monday: { $ref: '#/components/schemas/StoreTiming' },
                                        tuesday: { $ref: '#/components/schemas/StoreTiming' },
                                        wednesday: { $ref: '#/components/schemas/StoreTiming' },
                                        thursday: { $ref: '#/components/schemas/StoreTiming' },
                                        friday: { $ref: '#/components/schemas/StoreTiming' },
                                        saturday: { $ref: '#/components/schemas/StoreTiming' },
                                        sunday: { $ref: '#/components/schemas/StoreTiming' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
};

specs.paths['/api/retailers/delivery-areas'] = {
    put: {
        tags: ['Retailers'],
        summary: 'Update delivery areas',
        description: 'Update delivery areas and fees (retailer only)',
        security: [{ bearerAuth: [] }],
        requestBody: {
            required: true,
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            deliveryAreas: {
                                type: 'array',
                                items: {
                                    $ref: '#/components/schemas/DeliveryArea',
                                },
                            },
                        },
                    },
                },
            },
        },
        responses: {
            200: {
                description: 'Delivery areas updated successfully',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                deliveryAreas: {
                                    type: 'array',
                                    items: {
                                        $ref: '#/components/schemas/DeliveryArea',
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
};

specs.paths['/api/retailers/products'] = {
    get: {
        tags: ['Retailers'],
        summary: 'Get retailer products',
        description: 'Get all products for the authenticated retailer',
        security: [{ bearerAuth: [] }],
        parameters: [
            {
                name: 'page',
                in: 'query',
                description: 'Page number',
                schema: { type: 'integer', default: 1 },
            },
            {
                name: 'limit',
                in: 'query',
                description: 'Items per page',
                schema: { type: 'integer', default: 10 },
            },
            {
                name: 'sortBy',
                in: 'query',
                description: 'Field to sort by (createdAt, price, stock)',
                schema: { type: 'string', enum: ['createdAt', 'price', 'stock'] },
            },
            {
                name: 'sortOrder',
                in: 'query',
                description: 'Sort order (asc or desc)',
                schema: { type: 'string', enum: ['asc', 'desc'] },
            },
        ],
        responses: {
            200: {
                description: 'List of retailer products',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                products: {
                                    type: 'array',
                                    items: {
                                        $ref: '#/components/schemas/Product',
                                    },
                                },
                                page: { type: 'integer' },
                                totalPages: { type: 'integer' },
                                total: { type: 'integer' },
                            },
                        },
                    },
                },
            },
            401: {
                description: 'Unauthorized',
            },
            403: {
                description: 'Forbidden - User is not a retailer',
            },
        },
    },
};

// Add schemas
specs.components.schemas.DeliveryArea = {
    type: 'object',
    required: ['pincode', 'deliveryFee', 'minOrderAmount', 'estimatedTime'],
    properties: {
        pincode: {
            type: 'string',
            description: 'Pincode of the delivery area',
        },
        deliveryFee: {
            type: 'number',
            minimum: 0,
            description: 'Delivery fee for this area',
        },
        minOrderAmount: {
            type: 'number',
            minimum: 0,
            description: 'Minimum order amount for this area',
        },
        estimatedTime: {
            type: 'number',
            minimum: 0,
            description: 'Estimated delivery time in minutes',
        },
    },
};

// Support Ticket endpoints
specs.paths['/api/support'] = {
    post: {
        tags: ['Support'],
        summary: 'Create a support ticket',
        description: 'Create a new support ticket',
        security: [{ bearerAuth: [] }],
        requestBody: {
            required: true,
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        required: ['subject', 'category', 'message'],
                        properties: {
                            subject: {
                                type: 'string',
                                description: 'Ticket subject'
                            },
                            category: {
                                type: 'string',
                                enum: ['order', 'payment', 'delivery', 'product', 'account', 'other'],
                                description: 'Ticket category'
                            },
                            priority: {
                                type: 'string',
                                enum: ['low', 'medium', 'high', 'urgent'],
                                default: 'medium'
                            },
                            message: {
                                type: 'string',
                                description: 'Initial message'
                            },
                            orderId: {
                                type: 'string',
                                description: 'Related order ID (optional)'
                            },
                            retailerId: {
                                type: 'string',
                                description: 'Related retailer ID (optional)'
                            }
                        }
                    }
                }
            }
        },
        responses: {
            201: {
                description: 'Support ticket created successfully',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/SupportTicket'
                        }
                    }
                }
            }
        }
    },
    get: {
        tags: ['Support'],
        summary: 'Get customer tickets',
        description: 'Get all support tickets for the authenticated customer',
        security: [{ bearerAuth: [] }],
        parameters: [
            {
                name: 'status',
                in: 'query',
                description: 'Filter by ticket status',
                schema: {
                    type: 'string',
                    enum: ['open', 'in_progress', 'resolved', 'closed']
                }
            },
            {
                name: 'page',
                in: 'query',
                description: 'Page number',
                schema: { type: 'integer', default: 1 }
            },
            {
                name: 'limit',
                in: 'query',
                description: 'Items per page',
                schema: { type: 'integer', default: 10 }
            }
        ],
        responses: {
            200: {
                description: 'List of support tickets',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                data: {
                                    type: 'array',
                                    items: {
                                        $ref: '#/components/schemas/SupportTicket'
                                    }
                                },
                                pagination: {
                                    type: 'object',
                                    properties: {
                                        total: { type: 'integer' },
                                        page: { type: 'integer' },
                                        pages: { type: 'integer' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

specs.paths['/api/support/{ticketId}'] = {
    get: {
        tags: ['Support'],
        summary: 'Get ticket details',
        description: 'Get detailed information about a specific support ticket',
        security: [{ bearerAuth: [] }],
        parameters: [
            {
                name: 'ticketId',
                in: 'path',
                required: true,
                description: 'ID of the support ticket',
                schema: { type: 'string' }
            }
        ],
        responses: {
            200: {
                description: 'Support ticket details',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/SupportTicket'
                        }
                    }
                }
            },
            404: {
                description: 'Ticket not found'
            }
        }
    }
};

specs.paths['/api/support/{ticketId}/message'] = {
    post: {
        tags: ['Support'],
        summary: 'Add message to ticket',
        description: 'Add a new message to an existing support ticket',
        security: [{ bearerAuth: [] }],
        parameters: [
            {
                name: 'ticketId',
                in: 'path',
                required: true,
                description: 'ID of the support ticket',
                schema: { type: 'string' }
            }
        ],
        requestBody: {
            required: true,
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        required: ['message'],
                        properties: {
                            message: {
                                type: 'string',
                                description: 'Message content'
                            },
                            attachments: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        type: { type: 'string' },
                                        url: { type: 'string' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        responses: {
            200: {
                description: 'Message added successfully',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/SupportTicket'
                        }
                    }
                }
            }
        }
    }
};

specs.paths['/api/support/{ticketId}/status'] = {
    put: {
        tags: ['Support'],
        summary: 'Update ticket status',
        description: 'Update the status of a support ticket (admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [
            {
                name: 'ticketId',
                in: 'path',
                required: true,
                description: 'ID of the support ticket',
                schema: { type: 'string' }
            }
        ],
        requestBody: {
            required: true,
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        required: ['status'],
                        properties: {
                            status: {
                                type: 'string',
                                enum: ['open', 'in_progress', 'resolved', 'closed'],
                                description: 'New ticket status'
                            },
                            resolution: {
                                type: 'string',
                                description: 'Resolution details (required when status is resolved)'
                            }
                        }
                    }
                }
            }
        },
        responses: {
            200: {
                description: 'Ticket status updated successfully',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/SupportTicket'
                        }
                    }
                }
            },
            403: {
                description: 'Not authorized to update ticket status'
            }
        }
    }
};

specs.paths['/api/support/{ticketId}/feedback'] = {
    post: {
        tags: ['Support'],
        summary: 'Submit ticket feedback',
        description: 'Submit customer satisfaction feedback for a resolved ticket',
        security: [{ bearerAuth: [] }],
        parameters: [
            {
                name: 'ticketId',
                in: 'path',
                required: true,
                description: 'ID of the support ticket',
                schema: { type: 'string' }
            }
        ],
        requestBody: {
            required: true,
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        required: ['rating'],
                        properties: {
                            rating: {
                                type: 'number',
                                minimum: 1,
                                maximum: 5,
                                description: 'Satisfaction rating (1-5)'
                            },
                            feedback: {
                                type: 'string',
                                description: 'Additional feedback comments'
                            }
                        }
                    }
                }
            }
        },
        responses: {
            200: {
                description: 'Feedback submitted successfully',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/SupportTicket'
                        }
                    }
                }
            },
            403: {
                description: 'Not authorized to submit feedback for this ticket'
            }
        }
    }
};

// Customer endpoints
specs.paths['/api/customers'] = {
    post: {
        tags: ['Customers'],
        summary: 'Register a new customer',
        description: 'Create a new customer account',
        requestBody: {
            required: true,
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        required: ['email', 'password', 'name', 'phone'],
                        properties: {
                            email: { type: 'string', format: 'email' },
                            password: { type: 'string', minLength: 6 },
                            name: { type: 'string' },
                            phone: { type: 'string' }
                        }
                    }
                }
            }
        },
        responses: {
            201: {
                description: 'Customer registered successfully'
            }
        }
    }
};

specs.paths['/api/customers/login'] = {
    post: {
        tags: ['Customers'],
        summary: 'Customer login',
        description: 'Authenticate a customer',
        requestBody: {
            required: true,
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        required: ['email', 'password'],
                        properties: {
                            email: { type: 'string', format: 'email' },
                            password: { type: 'string' }
                        }
                    }
                }
            }
        },
        responses: {
            200: {
                description: 'Login successful',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                token: { type: 'string' },
                                user: { $ref: '#/components/schemas/Customer' }
                            }
                        }
                    }
                }
            }
        }
    }
};

// Retailer endpoints
specs.paths['/api/retailers'] = {
    post: {
        tags: ['Retailers'],
        summary: 'Register a new retailer',
        description: 'Create a new retailer account',
        requestBody: {
            required: true,
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        required: ['email', 'password', 'businessName', 'phone', 'businessType', 'taxId', 'address'],
                        properties: {
                            email: { type: 'string', format: 'email' },
                            password: { type: 'string', minLength: 6 },
                            businessName: { type: 'string' },
                            phone: { type: 'string' },
                            businessType: { type: 'string' },
                            taxId: { type: 'string' },
                            address: {
                                type: 'object',
                                required: ['street', 'city', 'state', 'postalCode', 'country'],
                                properties: {
                                    street: { type: 'string' },
                                    city: { type: 'string' },
                                    state: { type: 'string' },
                                    postalCode: { type: 'string' },
                                    country: { type: 'string' }
                                }
                            }
                        }
                    }
                }
            }
        },
        responses: {
            201: {
                description: 'Retailer registered successfully'
            }
        }
    }
};

specs.paths['/api/retailers/login'] = {
    post: {
        tags: ['Retailers'],
        summary: 'Retailer login',
        description: 'Authenticate a retailer',
        requestBody: {
            required: true,
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        required: ['email', 'password'],
                        properties: {
                            email: { type: 'string', format: 'email' },
                            password: { type: 'string' }
                        }
                    }
                }
            }
        },
        responses: {
            200: {
                description: 'Login successful',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                token: { type: 'string' },
                                user: { $ref: '#/components/schemas/Retailer' }
                            }
                        }
                    }
                }
            }
        }
    }
};

// Order endpoints
specs.paths['/api/orders'] = {
    post: {
        tags: ['Orders'],
        summary: 'Create a new order',
        description: 'Create a new order (customer only)',
        security: [{ bearerAuth: [] }],
        requestBody: {
            required: true,
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        required: ['items', 'shippingAddress', 'paymentMethod'],
                        properties: {
                            items: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    required: ['productId', 'quantity'],
                                    properties: {
                                        productId: { type: 'string' },
                                        quantity: { type: 'integer', minimum: 1 }
                                    }
                                }
                            },
                            shippingAddress: { type: 'string' },
                            paymentMethod: { type: 'string', enum: ['cash', 'card', 'upi'] }
                        }
                    }
                }
            }
        },
        responses: {
            201: {
                description: 'Order created successfully',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/Order'
                        }
                    }
                }
            }
        }
    },
    get: {
        tags: ['Orders'],
        summary: 'Get customer orders',
        description: 'Get all orders for the authenticated customer',
        security: [{ bearerAuth: [] }],
        parameters: [
            {
                name: 'status',
                in: 'query',
                description: 'Filter by order status',
                schema: {
                    type: 'string',
                    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
                }
            },
            {
                name: 'page',
                in: 'query',
                description: 'Page number',
                schema: { type: 'integer', default: 1 }
            },
            {
                name: 'limit',
                in: 'query',
                description: 'Items per page',
                schema: { type: 'integer', default: 10 }
            }
        ],
        responses: {
            200: {
                description: 'List of orders',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                data: {
                                    type: 'array',
                                    items: {
                                        $ref: '#/components/schemas/Order'
                                    }
                                },
                                pagination: {
                                    type: 'object',
                                    properties: {
                                        total: { type: 'integer' },
                                        page: { type: 'integer' },
                                        pages: { type: 'integer' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

// Product endpoints
specs.paths['/api/products'] = {
    get: {
        tags: ['Products'],
        summary: 'Get all products',
        description: 'Retrieve a list of all products with optional filtering',
        parameters: [
            {
                name: 'category',
                in: 'query',
                description: 'Filter by category',
                schema: { type: 'string' }
            },
            {
                name: 'page',
                in: 'query',
                description: 'Page number',
                schema: { type: 'integer', default: 1 }
            },
            {
                name: 'limit',
                in: 'query',
                description: 'Items per page',
                schema: { type: 'integer', default: 10 }
            }
        ],
        responses: {
            200: {
                description: 'List of products',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                data: {
                                    type: 'array',
                                    items: {
                                        $ref: '#/components/schemas/Product'
                                    }
                                },
                                pagination: {
                                    type: 'object',
                                    properties: {
                                        total: { type: 'integer' },
                                        page: { type: 'integer' },
                                        pages: { type: 'integer' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    post: {
        tags: ['Products'],
        summary: 'Create a new product',
        description: 'Create a new product (retailer only)',
        security: [{ bearerAuth: [] }],
        requestBody: {
            required: true,
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        required: ['name', 'description', 'price', 'stock', 'category'],
                        properties: {
                            name: { type: 'string' },
                            description: { type: 'string' },
                            price: { type: 'number', minimum: 0 },
                            stock: { type: 'integer', minimum: 0 },
                            category: { type: 'string' },
                            images: {
                                type: 'array',
                                items: { type: 'string' }
                            }
                        }
                    }
                }
            }
        },
        responses: {
            201: {
                description: 'Product created successfully',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/Product'
                        }
                    }
                }
            }
        }
    }
};

// Add schemas
specs.components.schemas.Customer = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string', format: 'email' },
        phone: { type: 'string' },
        addresses: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    type: { type: 'string', enum: ['home', 'work', 'other'] },
                    address: { type: 'string' },
                    city: { type: 'string' },
                    state: { type: 'string' },
                    country: { type: 'string' },
                    pincode: { type: 'string' },
                    isDefault: { type: 'boolean' }
                }
            }
        }
    }
};

specs.components.schemas.Retailer = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        businessName: { type: 'string' },
        businessType: { type: 'string' },
        email: { type: 'string', format: 'email' },
        phone: { type: 'string' },
        taxId: { type: 'string' },
        address: {
            type: 'object',
            properties: {
                street: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                postalCode: { type: 'string' },
                country: { type: 'string' }
            }
        },
        isActive: { type: 'boolean' }
    }
};

specs.components.schemas.Order = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        customerId: { type: 'string' },
        retailerId: { type: 'string' },
        items: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    productId: { type: 'string' },
                    quantity: { type: 'integer' },
                    price: { type: 'number' }
                }
            }
        },
        totalAmount: { type: 'number' },
        status: {
            type: 'string',
            enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
        },
        paymentStatus: {
            type: 'string',
            enum: ['pending', 'processing', 'completed', 'failed', 'refunded']
        },
        shippingAddress: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
    }
};

specs.components.schemas.Product = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'number' },
        stock: { type: 'integer' },
        category: { type: 'string' },
        images: {
            type: 'array',
            items: { type: 'string' }
        },
        retailerId: { type: 'string' },
        isActive: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
    }
};

export default specs; 