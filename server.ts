import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import axios from 'axios';
import { body, validationResult } from 'express-validator';

// TypeScript Interfaces
interface InquiryFormData {
    parentName: string;
    childName: string;
    childAge: number;
    email: string;
    phone: string;
    preferredProgram: string;
    message?: string;
}

interface FormattedInquiry {
    parentName: string;
    childName: string;
    childAge: number;
    email: string;
    phone: string;
    preferredProgram: string;
    message: string;
    formattedText: string;
}

interface ApiResponse {
    success: boolean;
    message?: string;
    error?: string;
}

// Environment variables (in production, use process.env)
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || 'YOUR_TELEGRAM_CHAT_ID';
const PORT = process.env.PORT || 3000;

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Input Sanitization Helper
function sanitizeInput(input: string): string {
    if (typeof input !== 'string') return '';
    return input
        .trim()
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .replace(/[&<>"']/g, (match) => {
            const escapeMap: { [key: string]: string } = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#x27;'
            };
            return escapeMap[match] || match;
        });
}

function sanitizePhone(phone: string): string {
    return phone.replace(/[^\d+\-() ]/g, '');
}

function sanitizeEmail(email: string): string {
    return email.toLowerCase().trim();
}

// Format inquiry for Telegram
function formatInquiry(data: InquiryFormData): FormattedInquiry {
    const programNames: { [key: string]: string } = {
        'toddlers': 'Toddlers (Ages 2-3)',
        'preschool': 'Preschool (Ages 4-5)',
        'lower-elementary': 'Lower Elementary (Ages 6-8)',
        'upper-elementary': 'Upper Elementary (Ages 9-12)',
        'not-sure': 'Not sure yet',
        '': 'Not specified'
    };

    const programName = programNames[data.preferredProgram] || data.preferredProgram;
    const message = data.message || 'No additional message provided.';

    const formattedText = `
📚 *New Inquiry - Kumagaya Kids English*

👨‍👩‍👧 *Parent Information:*
• Name: ${data.parentName}
• Email: ${data.email}
• Phone: ${data.phone}

👶 *Child Information:*
• Name: ${data.childName}
• Age: ${data.childAge} years old

📖 *Program Interest:*
${programName}

💬 *Message:*
${message}

---
_Received at ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}_
    `.trim();

    return {
        ...data,
        message,
        formattedText
    };
}

// Send to Telegram Bot API
async function sendToTelegram(formattedInquiry: FormattedInquiry): Promise<boolean> {
    try {
        const response = await axios.post(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
                chat_id: TELEGRAM_CHAT_ID,
                text: formattedInquiry.formattedText,
                parse_mode: 'Markdown'
            },
            {
                timeout: 10000
            }
        );
        return response.status === 200;
    } catch (error) {
        console.error('Telegram API Error:', error);
        return false;
    }
}

// Simulate sending confirmation email
async function sendConfirmationEmail(email: string, childName: string): Promise<boolean> {
    // In production, use a service like SendGrid, Mailgun, or AWS SES
    console.log(`📧 [SIMULATED] Sending confirmation email to ${email}`);
    console.log(`📧 [SIMULATED] Subject: Thank you for your inquiry - Kumagaya Kids English`);
    console.log(`📧 [SIMULATED] Body: Dear Parent, Thank you for your interest in Kumagaya Kids English. We have received your inquiry for ${childName} and will contact you within 24 hours.`);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return true;
}

// Validation rules
const inquiryValidation = [
    body('parentName')
        .trim()
        .notEmpty().withMessage('Parent name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Parent name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+$/).withMessage('Parent name contains invalid characters'),
    
    body('childName')
        .trim()
        .notEmpty().withMessage('Child name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Child name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+$/).withMessage('Child name contains invalid characters'),
    
    body('childAge')
        .isInt({ min: 2, max: 12 }).withMessage('Child age must be between 2 and 12 years'),
    
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),
    
    body('phone')
        .trim()
        .notEmpty().withMessage('Phone number is required')
        .matches(/^[\d+\-() ]{10,20}$/).withMessage('Please provide a valid phone number'),
    
    body('preferredProgram')
        .optional()
        .isIn(['toddlers', 'preschool', 'lower-elementary', 'upper-elementary', 'not-sure', '']).withMessage('Invalid program selection'),
    
    body('message')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('Message must not exceed 1000 characters')
];

// API Route: Submit Inquiry
app.post('/api/inquiry', inquiryValidation, async (req: Request, res: Response) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                errors: errors.array()
            } as ApiResponse);
        }

        // Get and sanitize form data
        const rawData: InquiryFormData = req.body;
        
        const sanitizedData: InquiryFormData = {
            parentName: sanitizeInput(rawData.parentName),
            childName: sanitizeInput(rawData.childName),
            childAge: parseInt(rawData.childAge.toString()),
            email: sanitizeEmail(rawData.email),
            phone: sanitizePhone(rawData.phone),
            preferredProgram: rawData.preferredProgram || '',
            message: rawData.message ? sanitizeInput(rawData.message) : ''
        };

        // Format inquiry
        const formattedInquiry = formatInquiry(sanitizedData);

        // Send to Telegram
        const telegramSuccess = await sendToTelegram(formattedInquiry);
        
        if (!telegramSuccess) {
            console.error('Failed to send to Telegram');
            // Continue anyway - we'll still send confirmation email
        }

        // Send confirmation email (simulated)
        const emailSuccess = await sendConfirmationEmail(
            sanitizedData.email,
            sanitizedData.childName
        );

        if (!emailSuccess) {
            console.error('Failed to send confirmation email');
        }

        // Return success response
        res.status(200).json({
            success: true,
            message: 'Thank you! Your inquiry has been received. We will contact you within 24 hours.'
        } as ApiResponse);

    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({
            success: false,
            error: 'An internal server error occurred. Please try again later.'
        } as ApiResponse);
    }
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({
        success: false,
        error: 'An unexpected error occurred'
    } as ApiResponse);
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 Kumagaya Kids English API is ready!`);
    
    if (TELEGRAM_BOT_TOKEN === 'YOUR_TELEGRAM_BOT_TOKEN') {
        console.warn('⚠️  Warning: Telegram Bot Token not configured. Set TELEGRAM_BOT_TOKEN environment variable.');
    }
    if (TELEGRAM_CHAT_ID === 'YOUR_TELEGRAM_CHAT_ID') {
        console.warn('⚠️  Warning: Telegram Chat ID not configured. Set TELEGRAM_CHAT_ID environment variable.');
    }
});

export default app;

