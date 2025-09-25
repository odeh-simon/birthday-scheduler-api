# Birthday Wisher Backend

A Node.js/Express backend application that automates sending birthday emails to users based on their date of birth. The system runs a daily cron job at 7 AM to identify users with birthdays and sends them personalized birthday emails.

## Features

- 🎂 **User Management**: Create users with username, email, and date of birth
- 📧 **Automated Emails**: Daily cron job sends birthday emails at 7 AM
- 🎨 **Beautiful Templates**: HTML email templates with responsive design
- 📝 **Comprehensive Logging**: Winston logging for all operations
- 🧪 **Full Test Coverage**: Jest tests for all endpoints and services
- 🔒 **Data Validation**: Input validation and error handling
- 🗄️ **MongoDB Storage**: Persistent data storage with Mongoose

## Tech Stack

- **Node.js** with Express
- **MongoDB** with Mongoose ODM
- **Winston** for logging
- **Jest** for testing
- **Nodemailer** for email sending
- **Node-cron** for scheduling
- **Express-validator** for input validation

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Gmail account with App Password

## Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/birthday-wisher
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password
NODE_ENV=development
```

4. Set up Gmail App Password:
   - Enable 2-factor authentication on your Gmail account
   - Generate an App Password for this application
   - Use the App Password in the `GMAIL_PASS` environment variable

## Usage

### Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

### API Endpoints

#### Health Check
```http
GET /
GET /health
```

#### User Management
```http
POST /users
Content-Type: application/json

{
  "username": "John Doe",
  "email": "john@example.com",
  "dob": "1990-05-15"
}
```

#### Get All Users
```http
GET /users
```

#### Get Users with Birthdays Today
```http
GET /users/birthdays
```

#### Test Email Configuration
```http
GET /test-email
```

#### Manual Birthday Email Trigger (for testing)
```http
POST /trigger-birthday-emails
```

## Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Project Structure

```
src/
├── config/
│   ├── db.js          # Database connection
│   └── logger.js       # Winston logging configuration
├── controllers/
│   └── userController.js  # User API endpoints
├── models/
│   └── User.js         # User Mongoose schema
├── services/
│   ├── emailService.js # Email sending service
│   └── cronService.js  # Cron job service
├── logs/               # Log files
└── index.js           # Main server file

tests/
├── setup.js           # Test configuration
├── user.test.js       # User API tests
└── email.test.js      # Email service tests
```

## Cron Job

The birthday email cron job runs daily at 7:00 AM UTC. It:

1. Queries the database for users whose birthday is today
2. Sends personalized birthday emails to each user
3. Logs the results and any errors

## Email Template

The birthday emails include:
- Personalized greeting with the user's name
- Beautiful HTML template with responsive design
- Birthday celebration emojis and images
- Professional styling and layout

## Logging

The application uses Winston for comprehensive logging:

- **Console**: Development logs with colors
- **Files**: 
  - `src/logs/combined.log` - All logs
  - `src/logs/error.log` - Error logs only

Log levels include:
- API requests and responses
- Email sending operations
- Cron job execution
- Database operations
- Error handling

## Error Handling

The application includes comprehensive error handling:

- Input validation with detailed error messages
- Duplicate email detection
- Database connection errors
- Email sending failures
- Global error handler for unhandled errors

## Security Features

- Environment variables for sensitive data
- Input validation and sanitization
- Email uniqueness constraints
- Date validation (no future dates)
- Graceful error handling

## Development

### Adding New Features

1. Create new models in `src/models/`
2. Add controllers in `src/controllers/`
3. Implement services in `src/services/`
4. Write tests in `tests/`
5. Update documentation

### Database Operations

The application uses Mongoose for MongoDB operations:

- User schema with validation
- Unique email constraint
- Date of birth validation
- Virtual fields for age calculation

## Production Deployment

For production deployment:

1. Update environment variables
2. Use a production MongoDB instance
3. Configure proper logging levels
4. Set up monitoring and alerting
5. Use a process manager like PM2
6. Consider using a cloud scheduler instead of node-cron

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support or questions, please open an issue in the repository.
