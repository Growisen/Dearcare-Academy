import nodemailer from 'nodemailer';

async function send_mail(details: any) {


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

export async function enquiry_reply(details: any) {
  const { name, email, message } = details;

  const subject = `Course Enquiry - ${details.courseName}`;
  const text = `Hi ${name},\n\nThank you for your interest in ${details.courseName}.\n\nPlease find the brochure attached and use the link below to register:\n\n[Registration Link]\n\nYour message: ${message}`;

  const html = `
    <p>Hi <strong>${name}</strong>,</p>
    <p>Thank you for your interest in <strong>${details.courseName}</strong>.</p>
    <p>Please find the course brochure attached.</p>
    <p>You can register here: <a href="https://your-site.com/register?course=${encodeURIComponent(details.courseName)}">Register Now</a></p>
    <hr />
    <p><strong>Your message:</strong><br>${message}</p>
  `;
  return await send_mail({ to: email, subject, text, html });
}

export async function receipt_upload(details: any) {

    const { name, email} = details;
  
    const subject = `Upload Your Fee Payment Receipt`;
    const uploadLink = `https://yourwebsite.com/upload-receipt`; // Replace with the actual upload link
  
    const text = `Dear ${name},\nYour registration has been verified and you can now pay your fees.\nKindly upload your payment receipt in the url provided\nPlease upload your fee payment receipt using the following link:\n${uploadLink}\n\nThank you.`;
    const html = `<p>Dear <strong>${name}</strong>,</p><p>Please upload your fee payment receipt using the following link:</p><p><a href="${uploadLink}">${uploadLink}</a></p><p>Thank you.</p>`;
  
    return await send_mail({ to: email, subject, text, html });
}

export async function confirmation_mail(details: any) {
    const { name, email, message } = details;
  
    const subject = `Registration Approved`;
  
    const text = `Dear ${name},\n\nYour registration details have been successfully verified and approved. You can now proceed with the next steps.\n\nThank you.`;
  
    const html = `<p>Dear <strong>${name}</strong>,</p><p>Your registration details have been successfully verified and approved. You can now proceed with the next steps.</p><p>Thank you.</p>`;
    return await send_mail({ to: email, subject, text, html });
}

