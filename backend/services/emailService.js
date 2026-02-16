// backend/services/emailService.js
import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import config from '../config/index.js';

// Option 1: Using SMTP (e.g., Gmail with App Password)
const transporter = nodemailer.createTransport({
  host: config.EMAIL_SERVICE_HOST,
  port: config.EMAIL_SERVICE_PORT,
  secure: config.EMAIL_SERVICE_PORT == 465, // Use 'true' for port 465, 'false' for other ports like 587
  auth: {
    user: config.EMAIL_SERVICE_USER,
    pass: config.EMAIL_SERVICE_PASS,
  },
});

// Option 2 (More robust for Gmail): Using OAuth2 for Gmail (Requires more setup on Google Cloud Console)
// This is more complex but recommended for production Gmail usage to avoid app password issues.
// const OAUTH_PLAYGROUND = 'https://developers.google.com/oauthplayground';
// const oauth2Client = new google.auth.OAuth2(
//   config.GOOGLE_CLIENT_ID,
//   config.GOOGLE_CLIENT_SECRET,
//   OAUTH_PLAYGROUND
// );
// oauth2Client.setCredentials({
//   refresh_token: config.GOOGLE_REFRESH_TOKEN, // You'd need to get a refresh token manually or via a separate OAuth flow
// });

// const sendMail = async (to, subject, htmlContent) => {
//   try {
//     const accessToken = await oauth2Client.getAccessToken(); // Get new access token with refresh token
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         type: 'OAuth2',
//         user: config.EMAIL_SERVICE_USER,
//         clientId: config.GOOGLE_CLIENT_ID,
//         clientSecret: config.GOOGLE_CLIENT_SECRET,
//         refreshToken: config.GOOGLE_REFRESH_TOKEN,
//         accessToken: accessToken.token,
//       },
//     });

//     const mailOptions = {
//       from: `ART BLOOM <${config.EMAIL_SERVICE_USER}>`,
//       to: to,
//       subject: subject,
//       html: htmlContent,
//     };

//     await transporter.sendMail(mailOptions);
//     console.log(`Email sent to ${to}`);
//   } catch (error) {
//     console.error(`Error sending email to ${to}:`, error);
//     throw new Error(`Email sending failed: ${error.message}`);
//   }
// };

// Using Option 1 (simpler SMTP setup for initial development)
const sendMail = async (to, subject, htmlContent) => {
  const mailOptions = {
    from: `ART BLOOM <${config.EMAIL_SERVICE_USER}>`,
    to: to,
    subject: subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    // In production, you might want to log this error and maybe retry
    throw new Error('Email sending failed.');
  }
};

const sendWelcomeEmail = async (userEmail, userName) => {
  const subject = 'Welcome to ART BLOOM!';
  const htmlContent = `
    <h1>Hello ${userName || 'Artist'}!</h1>
    <p>Thank you for signing in to ART BLOOM. We're thrilled to have you join our creative community!</p>
    <p>Start exploring beautiful art, connect with artists, or showcase your own masterpieces.</p>
    <p>Dive in and discover what ART BLOOM has to offer:</p>
    <p><a href="http://localhost:3000/discover" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Explore ART BLOOM</a></p>
    <p>If you have any questions, feel free to reply to this email.</p>
    <p>Happy creating!<br>The ART BLOOM Team</p>
  `;
  await sendMail(userEmail, subject, htmlContent);
};

// You can add more specific email functions here (e.g., order confirmation, password reset)
const sendOrderConfirmationEmail = async (userEmail, userName, orderDetails) => {
  const subject = `Your ART BLOOM Order #${orderDetails._id} Confirmed!`;
  const htmlContent = `
    <h1>Hello ${userName}!</h1>
    <p>Your order at ART BLOOM has been successfully placed and confirmed!</p>
    <p><strong>Order ID:</strong> ${orderDetails._id}</p>
    <p><strong>Total Amount:</strong> $${orderDetails.totalPrice.toFixed(2)}</p>
    <h2>Order Items:</h2>
    <ul>
      ${orderDetails.orderItems.map(item => `
        <li>${item.name} (x${item.qty}) - $${item.price.toFixed(2)}</li>
      `).join('')}
    </ul>
    <p>We'll notify you once your order has been shipped.</p>
    <p>Thank you for supporting ART BLOOM artists!</p>
    <p>The ART BLOOM Team</p>
  `;
  await sendMail(userEmail, subject, htmlContent);
};


export {
  sendMail,
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  // Add other email functions as needed
};










//the below is a new code for e-mail service if the above has got any issues or errors use this one instead

// import nodemailer from 'nodemailer';
// import dotenv from 'dotenv';
// dotenv.config();

// // Create reusable transporter object using the default SMTP transport
// const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//     },
// });

// const sendEmail = async (options) => {
//     const mailOptions = {
//         from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
//         to: options.email,
//         subject: options.subject,
//         html: options.html,
//         text: options.text, // Fallback for email clients that don't support HTML
//     };

//     await transporter.sendMail(mailOptions);
// };

// // Example function to send a user verification email
// const sendVerificationEmail = async (email, name, userId) => {
//     const verificationLink = `${process.env.CLIENT_URL}/verify-email?id=${userId}`; // Adjust as per your frontend route
//     const subject = 'Verify Your ArtBloom Account';
//     const html = `
//         <p>Hello ${name},</p>
//         <p>Thank you for registering with ArtBloom! Please verify your email by clicking on the link below:</p>
//         <p><a href="${verificationLink}">Verify My Email</a></p>
//         <p>If you did not register for an account, please ignore this email.</p>
//         <p>Regards,</p>
//         <p>The ArtBloom Team</p>
//     `;
//     const text = `Hello ${name},\nThank you for registering with ArtBloom! Please verify your email by visiting: ${verificationLink}\nIf you did not register for an account, please ignore this email.\nRegards,\nThe ArtBloom Team`;

//     await sendEmail({
//         email,
//         subject,

// this one is also not a complete one just for the main logic i'm pasting it here for future reference. 