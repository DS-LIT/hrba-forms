"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const multer_1 = __importDefault(require("multer"));
const cors_1 = __importDefault(require("cors"));
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
// Validate environment variables
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("Error: EMAIL_USER and EMAIL_PASS must be set in the .env file.");
    process.exit(1);
}
// Middleware for parsing form data
const upload = (0, multer_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());
app.post('/api/send-email', upload.single('file'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const file = req.file;
        if (!file) {
            res.status(400).json({ message: 'Email and file are required.' });
            return;
        }
        // Create a Nodemailer transporter
        const transporter = nodemailer_1.default.createTransport({
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
        yield transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Email sent successfully.' });
    }
    catch (error) {
        console.error('Error sending email:', error.message, error.stack);
        res.status(500).json({ message: 'Failed to send email.', error: error.message });
    }
}));
// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
