import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Create transporter using Hostinger SMTP (optimized for Vercel)
    const transporter = nodemailer.createTransport({
      host: 'smtp.hostinger.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER, // info@elysionsoftwares.com
        pass: process.env.EMAIL_PASS, // Password for info@elysionsoftwares.com
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Email content
    const mailOptions = {
      from: `"Sobhagya Contact Form" <${process.env.EMAIL_USER}>`, // From info@elysionsoftwares.com
      to: 'info@sobhagya.in', // Always send to info@sobhagya.in
      replyTo: email, // User's email for reply
      subject: `New Contact Form Message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #F7971D; margin: 0; font-size: 28px; font-weight: bold;">SOBHAGYA</h1>
              <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Astrology & Spiritual Services</p>
            </div>
            
            <h2 style="color: #333; text-align: center; margin-bottom: 30px; font-size: 22px; border-bottom: 2px solid #F7971D; padding-bottom: 10px;">
              New Contact Form Submission
            </h2>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #F7971D;">
              <h3 style="color: #333; margin-bottom: 15px; font-size: 18px;">Contact Details:</h3>
              <p style="margin: 8px 0; color: #555; font-size: 16px;"><strong>Name:</strong> ${name}</p>
              <p style="margin: 8px 0; color: #555; font-size: 16px;"><strong>Email/Phone:</strong> ${email}</p>
              <p style="margin: 8px 0; color: #555; font-size: 14px;"><strong>Submitted:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #F7971D;">
              <h3 style="color: #333; margin-bottom: 15px; font-size: 18px;">Message:</h3>
              <div style="background-color: white; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">
                <p style="color: #555; line-height: 1.6; white-space: pre-wrap; margin: 0; font-size: 15px;">${message}</p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #888; font-size: 14px; margin: 0;">
                This message was sent from the Sobhagya contact form at <strong>sobhagya.in</strong>
              </p>
              <p style="color: #888; font-size: 12px; margin: 5px 0 0 0;">
                Sent from: info@elysionsoftwares.com (Hostinger Mail) | Delivered to: info@sobhagya.in
              </p>
            </div>
          </div>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: 'Message sent successfully!' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    );
  }
}
