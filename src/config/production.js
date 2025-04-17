export default {
    // Security settings
    cors: {
        origin: process.env.ALLOWED_ORIGINS.split(','),
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
    },
    
    // Rate limiting
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
    },
    
    // Compression
    compression: {
        level: 6,
        threshold: '1kb'
    },
    
    // Logging
    logging: {
        level: 'info',
        format: 'combined'
    },
    
    // Cache control
    cacheControl: {
        maxAge: 3600 // 1 hour
    },
    
    // Security headers
    security: {
        helmet: {
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'", "'unsafe-inline'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    imgSrc: ["'self'", "data:", "https:"],
                    connectSrc: ["'self'"]
                }
            }
        }
    }
}; 