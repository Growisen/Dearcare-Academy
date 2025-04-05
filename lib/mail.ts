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
  
    return await send_mail({ to: email, subject, text, html });
}

export async function confirmation_mail(details: MailDetailsConfirmation) {
    const { name, email, courseName } = details;
  
    const subject = `Registration Approved - ${courseName}`;
  
    const text = `Dear ${name},\n\nYour registration details for ${courseName} have been successfully verified and approved. You can now proceed with the next steps.\n\nThank you.`;
  
    const html = `<p>Dear <strong>${name}</strong>,</p><p>Your registration details for <strong>${courseName}</strong> have been successfully verified and approved. You can now proceed with the next steps.</p><p>Thank you.</p>`;
    return await send_mail({ to: email, subject, text, html });
}

