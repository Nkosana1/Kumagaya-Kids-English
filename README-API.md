# Kumagaya Kids English - API Server

TypeScript backend server for handling inquiry form submissions.

## Features

- ✅ Form validation with clear error messages
- ✅ Input sanitization for security
- ✅ Telegram Bot API integration
- ✅ Email confirmation (simulated)
- ✅ TypeScript interfaces for type safety
- ✅ Express.js with CORS support

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Create .env file
touch .env
```

Edit `.env` and add the following variables:
```
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHAT_ID=your_telegram_chat_id_here
PORT=3000
```

**Getting Telegram Credentials:**
- **TELEGRAM_BOT_TOKEN**: 
  1. Message [@BotFather](https://t.me/BotFather) on Telegram
  2. Send `/newbot` and follow instructions
  3. Copy the token provided
  
- **TELEGRAM_CHAT_ID**: 
  1. Message [@userinfobot](https://t.me/userinfobot) on Telegram
  2. Copy your chat ID from the response
  3. Or create a group and add [@userinfobot](https://t.me/userinfobot) to get the group chat ID

### 3. Build TypeScript

```bash
npm run build
```

### 4. Run the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will run on `http://localhost:3000`

## API Endpoints

### POST `/api/inquiry`

Submit an inquiry form.

**Request Body:**
```json
{
  "parentName": "John Doe",
  "childName": "Jane Doe",
  "childAge": 5,
  "email": "parent@example.com",
  "phone": "+81-90-1234-5678",
  "preferredProgram": "preschool",
  "message": "Optional message"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Thank you! Your inquiry has been received..."
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": [...]
}
```

### GET `/api/health`

Health check endpoint.

## Form Validation

- **Parent Name**: Required, 2-100 characters, letters only
- **Child Name**: Required, 2-100 characters, letters only
- **Child Age**: Required, integer between 2-12
- **Email**: Required, valid email format
- **Phone**: Required, 10-20 characters, numbers and basic symbols
- **Preferred Program**: Optional, must be valid option
- **Message**: Optional, max 1000 characters

## Security Features

- Input sanitization (HTML tag removal, XSS prevention)
- Email normalization
- Phone number sanitization
- Type validation with TypeScript
- Express-validator for server-side validation

## Telegram Integration

Inquiries are automatically sent to a Telegram chat via the Bot API. The message includes:
- Parent and child information
- Program preference
- Contact details
- Timestamp

## Email Confirmation

Currently simulated (logs to console). In production, integrate with:
- SendGrid
- Mailgun
- AWS SES
- Nodemailer with SMTP

## Development

Watch for changes:
```bash
npm run watch
```

## License

MIT

