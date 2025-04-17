# Business Backend API

Backend API for the local business platform.

## Features

- User authentication and authorization
- Product management
- Order processing
- Store management
- Support ticket system
- Analytics and reporting

## Prerequisites

- Node.js v18 or higher
- MongoDB Atlas account
- Environment variables (see `.env.example`)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=3001
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables
4. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

This application is configured for deployment on Render.com:

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the following environment variables in Render:
   - `PORT`
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
4. Deploy!

## API Documentation

Once the server is running, visit `http://localhost:3001/api-docs` for the Swagger documentation.

## Testing

Run the test suite:
```bash
npm test
```

## License

MIT