import express from 'express';
import nodemailer from 'nodemailer';
import multer from 'multer';
import cors from 'cors';

const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Validate environment variables
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("Error: EMAIL_USER and EMAIL_PASS must be set in the .env file.");
    process.exit(1);
}

// Middleware for parsing form data
const upload = multer();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Email sending endpoint
interface EmailRequestBody {
    email: string;
}

app.use(cors());

app.post('/api/send-email', upload.single('file'), async (req: express.Request & { file?: Express.Multer.File }, res: express.Response): Promise<void> => {
    try {
        const file = req.file;

        if (!file) {
            res.status(400).json({ message: 'Email and file are required.' });
            return;
        }

        // Create a Nodemailer transporter
        const transporter = nodemailer.createTransport({
            host: 'smtp.office365.com', // Outlook SMTP server
            port: 587,
            secure: false, // Use TLS
            auth: {
                user: process.env.EMAIL_USER, // Your Outlook email address
                pass: process.env.EMAIL_PASS, // Your Outlook email password or app password
            },
        });

        // Email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: "itadmin@hillsraiders.com.au",
            subject: 'Referee Tribunal Report',
            text: 'Please find the attached report.',
            attachments: [
                {
                    filename: file.originalname,
                    content: file.buffer,
                },
            ],
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Email sent successfully.' });
    } catch (error: any) {
        console.error('Error sending email:', error.message, error.stack);
        res.status(500).json({ message: 'Failed to send email.', error: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});