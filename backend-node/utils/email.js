import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendOtpEmail(email, otp, expiresInMinutes = 5) {
  try {
    const mailOptions = {
      from: `"100 Crores Club Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '�� Your Login OTP Code',
      html: `<!DOCTYPE html><html><head><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px}.container{background-color:#f9f9f9;border-radius:10px;padding:30px;border:1px solid #e0e0e0}.header{text-align:center;margin-bottom:30px}.header h1{color:#2563eb;margin:0}.otp-box{background-color:#2563eb;color:white;font-size:32px;font-weight:bold;letter-spacing:8px;text-align:center;padding:20px;border-radius:8px;margin:30px 0}.info{background-color:#fff;padding:20px;border-radius:8px;border-left:4px solid #2563eb;margin:20px 0}.warning{color:#dc2626;font-size:14px;text-align:center;margin-top:20px}.footer{text-align:center;color:#666;font-size:12px;margin-top:30px;padding-top:20px;border-top:1px solid #e0e0e0}</style></head><body><div class="container"><div class="header"><h1>�� Admin Login Verification</h1></div><p>Hello Admin,</p><p>You've requested to log in to your <strong>100 Crores Club Admin Panel</strong>.</p><p>Your One-Time Password (OTP) is:</p><div class="otp-box">${otp}</div><div class="info"><p><strong>⏰ Valid for ${expiresInMinutes} minutes</strong></p><p>Please enter this code on the login page to complete your authentication.</p></div><p class="warning">⚠️ If you didn't request this code, please ignore this email and ensure your account is secure.</p><div class="footer"><p>This is an automated email from 100 Crores Club Admin System.</p><p>Please do not reply to this email.</p></div></div></body></html>`,
      text: `100 Crores Club Admin Login Verification\n\nYour OTP code is: ${otp}\n\nThis code is valid for ${expiresInMinutes} minutes.\n\nIf you didn't request this code, please ignore this email.`,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
}

export async function verifyEmailConfig() {
  try {
    await transporter.verify();
    console.log('✅ Email server is ready to send emails');
    return true;
  } catch (error) {
    console.error('❌ Email server error:', error.message);
    return false;
  }
}
