import nodemailer from 'nodemailer';
import { DOMAIN } from '../config/constants';

interface MailDetails {
    to: string;
    subject: string;
    text: string;
    html: string;
}

interface MailDetailsEnquiry{
    name: string;
    email: string;
    courseName: string;
    courseFees?: number;
    regFees?: number;
}

interface MailDetailsReceipt{
    name: string;
    email: string;
    courseFees?: number;
    regFees?: number;
}

interface MailDetailsConfirmation{
  name: string;
  email: string;
  courseName: string;
}

async function send_mail(details: MailDetails) {


  const { to, subject, text, html } = details;

  const transporter = nodemailer.createTransport({
    service: 'Gmail', // or use 'smtp.ethereal.email' for testing
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"DearCare Academy" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    return ({ success: true , message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email error:', error);
    return ({success: false , message: 'Email failed', error });
  }
}

export async function enquiry_reply(details: MailDetailsEnquiry) {
  const { name, email, courseFees, regFees } = details;

  const subject = `Course Enquiry - ${details.courseName}`;
  const text = `Hi ${name},\n\nThank you for your interest in ${details.courseName}.\n\nCourse Details:\nRegistration Fee: ₹${regFees}\nCourse Fee: ₹${courseFees}\n\nPlease find the brochure attached and use the link below to register:\n\n[Registration Link]\n`;

  const html = `
    <p>Hi <strong>${name}</strong>,</p>
    <p>Thank you for your interest in <strong>${details.courseName}</strong>.</p>
    <p>Course Details:</p>
    <ul>
      <li>Registration Fee: ₹${regFees}</li>
      <li>Course Fee: ₹${courseFees}</li>
    </ul>
    <p>Please find the course brochure attached.</p>
    <p>You can register here: <a href="https://your-site.com/register?course=${encodeURIComponent(details.courseName)}">Register Now</a></p>
    <hr />
  
  `;
  return await send_mail({ to: email, subject, text, html });
}

export async function receipt_upload(details: MailDetailsReceipt & { courseName: string; studentId: string }) {
    const { name, email, courseFees, regFees, courseName, studentId } = details;
  
    const subject = `Upload Your Fee Payment Receipt - ${courseName}`;
    const uploadLink = `${DOMAIN}/receipt_upload/${studentId}`;
  
    const text = `Dear ${name},
Your registration for ${courseName} has been verified and you can now proceed with the fee payment.

Fee Details:
Registration Fee: ₹${regFees || 'N/A'}
Course Fee: ₹${courseFees || 'N/A'}

Kindly upload your payment receipt using the following link:
${uploadLink}

Thank you.`;

/*
    const html = `
      <p>Dear <strong>${name}</strong>,</p>
      <p>Your registration for <strong>${courseName}</strong> has been verified and you can now proceed with the fee payment.</p>
      <p>Fee Details:</p>
      <ul>
        <li>Registration Fee: ₹${regFees || 'N/A'}</li>
        <li>Course Fee: ₹${courseFees || 'N/A'}</li>
      </ul>
      <p>Kindly upload your payment receipt using the following link:</p>
      <p><a href="${uploadLink}">${uploadLink}</a></p>
      <p>Thank you.</p>
    `;
  */


    const html=`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>DearCare Academy</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333333; background-color: #f7f7f7;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <!-- Header -->
            <tr>
              <td style="background-color: #0056b3; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-weight: 600;">DearCare Academy</h1>
              </td>
            </tr>
            
            <!-- Main Content -->
            <tr>
              <td style="padding: 30px 25px;">
                <p style="margin-top: 0; font-size: 16px; line-height: 1.5;">Dear ${name},</p>
                
                <p style="font-size: 16px; line-height: 1.5;">Your registration for <strong>${courseName}</strong> has been verified and you can now proceed with the fee payment.</p>
                
                <div style="background-color: #f8f9fa; border-left: 4px solid #0056b3; padding: 15px; margin: 25px 0;">
                  <h3 style="margin-top: 0; color: #0056b3; font-size: 18px;">Fee Details:</h3>
                  <p style="margin-bottom: 5px; font-size: 16px;">
                    <ul>
                      <li>Registration Fee: ₹${regFees}</li>
                      <li>Course Fee: ₹${courseFees}</li>
                    </ul>
                  </p>
                  <p style="margin-bottom: 5px; font-size: 16px;">
                    Kindly upload your payment receipt using the following link:
                  </p>
                  <p style="text-align: center; margin: 20px 0;">
                    <a href="${uploadLink}" style="background-color: #0056b3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Upload Payment Receipt</a>
                  </p>
                </div>
                
                <p style="font-size: 16px; line-height: 1.5;">Thank you for your cooperation.</p>
                
                <p style="font-size: 16px; line-height: 1.5;">Sincerely,</p>
                <p style="font-size: 16px; line-height: 1.5; margin-bottom: 0;"><strong>The DearCare Team</strong></p>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="background-color: #f2f2f2; padding: 20px 25px; border-top: 1px solid #dddddd;">
                <p style="font-size: 12px; color: #666666; margin-top: 0; margin-bottom: 10px;">This is a confidential communication with information intended only for the named recipient. If you have received this communication in error, please notify the sender immediately.</p>
                <p style="font-size: 12px; color: #666666; margin-bottom: 0;">&copy; DearCare Health Services. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;


    return await send_mail({ to: email, subject, text, html });
}

export async function confirmation_mail(details: MailDetailsConfirmation) {
    const { name, email, courseName } = details;
  
    const subject = `Registration Approved - ${courseName}`;
  
    const text = `Dear ${name},\n\nYour registration details for ${courseName} have been successfully verified and approved. You can now proceed with the next steps.\n\nThank you.`;
  
    const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>DearCare Academy</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333333; background-color: #f7f7f7;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                <!-- Header -->
                <tr>
                    <td style="background-color: #0056b3; padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-weight: 600;">DearCare Academy</h1>
                    </td>
                </tr>
                
                <!-- Main Content -->
                <tr>
                    <td style="padding: 30px 25px;">
                        <p style="margin-top: 0; font-size: 16px; line-height: 1.5;">Dear ${name},</p>
                        
                        <p style="font-size: 16px; line-height: 1.5;">Your registration details for <strong>${courseName}</strong> have been successfully verified and approved. You can now proceed with the next steps.</p>
                        
                        <p style="font-size: 16px; line-height: 1.5;">We will contact you immediately with further details.</p>
                        
                        <p style="font-size: 16px; line-height: 1.5;">Thank you for your cooperation.</p>
                        
                        <p style="font-size: 16px; line-height: 1.5;">Sincerely,</p>
                        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 0;"><strong>The DearCare Team</strong></p>
                    </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                    <td style="background-color: #f2f2f2; padding: 20px 25px; border-top: 1px solid #dddddd;">
                        <p style="font-size: 12px; color: #666666; margin-top: 0; margin-bottom: 10px;">This is a confidential communication with information intended only for the named recipient. If you have received this communication in error, please notify the sender immediately.</p>
                        <p style="font-size: 12px; color: #666666; margin-bottom: 0;">&copy; DearCare Health Services. All rights reserved.</p>
                    </td>
                </tr>
            </table>
        </body>
        </html>`;

    return await send_mail({ 
        to: email, 
        subject, 
        text, 
        html: html.trim() 
    });
}

