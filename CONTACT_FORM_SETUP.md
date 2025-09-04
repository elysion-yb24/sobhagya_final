# Contact Form Setup with Nodemailer for Vercel

## Overview
The contact form is now fully functional with Nodemailer integration optimized for Vercel hosting. It will send emails from `info@elysionsoftwares.com` (Hostinger mail) to `info@sobhagya.in` when users submit the contact form.

## Setup Instructions for Vercel

### 1. Vercel Environment Variables
In your Vercel dashboard, go to your project settings and add these environment variables:

```env
# Email address that will send the emails (info@elysionsoftwares.com)
EMAIL_USER=info@elysionsoftwares.com

# Password for info@elysionsoftwares.com Hostinger mail account
EMAIL_PASS=your-hostinger-mail-password
```

### 2. Hostinger Mail Setup for info@elysionsoftwares.com
1. Log into your Hostinger control panel
2. Go to Email section
3. Ensure `info@elysionsoftwares.com` email account is created
4. Use the regular password for this email account (not an app password)
5. Make sure the email account is active and working

### 3. Email Configuration
- **EMAIL_USER**: `info@elysionsoftwares.com` (the sending email)
- **EMAIL_PASS**: Regular password for `info@elysionsoftwares.com` Hostinger mail
- **TO EMAIL**: `info@sobhagya.in` (hardcoded in the API - receives all messages)
- **SMTP HOST**: `smtp.hostinger.com`
- **SMTP PORT**: `587`

## Features

### Contact Form Features:
- ✅ **Beautiful UI**: Enhanced form with emojis and animations
- ✅ **Form Validation**: All fields are required
- ✅ **Loading States**: Shows "Sending..." while submitting
- ✅ **Success/Error Messages**: Beautiful notifications with auto-dismiss
- ✅ **Form Reset**: Clears form after successful submission

### Email Features:
- ✅ **Professional HTML Email**: Beautifully formatted email template with Sobhagya branding
- ✅ **Contact Details**: Includes name, email/phone, message, and timestamp
- ✅ **Branded Design**: Matches your website's orange theme (#F7971D)
- ✅ **Error Handling**: Proper error handling and user feedback
- ✅ **Vercel Optimized**: Configured specifically for Vercel hosting

## Email Flow
1. **User fills form** → Contact form on `/contact`
2. **Form submission** → API call to `/api/contact`
3. **Email sent from** → `info@elysionsoftwares.com`
4. **Email delivered to** → `info@sobhagya.in`
5. **Reply-to set** → User's email address (for easy replies)

## API Endpoint
- **URL**: `/api/contact`
- **Method**: POST
- **Content-Type**: application/json
- **Hosting**: Optimized for Vercel

### Request Body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello, I would like to know more about your services."
}
```

### Response:
```json
{
  "message": "Message sent successfully!"
}
```

## Vercel Deployment Steps
1. **Set Environment Variables** in Vercel dashboard:
   - `EMAIL_USER` = `info@elysionsoftwares.com`
   - `EMAIL_PASS` = `your-app-password`
2. **Deploy to Vercel** using your preferred method
3. **Test the contact form** on your live site
4. **Verify emails** are received at `info@sobhagya.in`

## Testing
1. Fill out the contact form on `/contact`
2. Submit the form
3. Check `info@sobhagya.in` for the new message
4. Verify the email contains all the form data and proper branding

## Troubleshooting

### Common Issues:
1. **"Failed to send message"**: Check Hostinger mail password for `info@elysionsoftwares.com`
2. **"Authentication failed"**: Verify the email account exists and is active in Hostinger
3. **"Invalid credentials"**: Verify EMAIL_USER and EMAIL_PASS in Vercel environment variables
4. **"Vercel timeout"**: Email sending is optimized for Vercel's serverless functions
5. **"SMTP connection failed"**: Check if Hostinger SMTP is accessible from Vercel

### Hostinger Mail Security for info@elysionsoftwares.com:
- Use the regular email password (not an app password)
- Ensure the email account is created and active in Hostinger control panel
- Keep your email password secure and don't share it
- Make sure the email account has proper permissions for sending emails

## Security Notes
- Environment variables are secure in Vercel and not exposed to the client
- Form validation prevents empty submissions
- Email content is sanitized and properly formatted
- SMTP connection is secured with TLS
- Reply-to header allows direct responses to users

## Email Template Features
- **Sobhagya Branding**: Logo and orange theme
- **Professional Layout**: Clean, organized design
- **Contact Information**: Name, email/phone, timestamp
- **Message Display**: Formatted message in a clean box
- **Footer Information**: Source and delivery details
- **Mobile Responsive**: Works on all email clients

## Customization
You can customize the email template in `/app/api/contact/route.ts` by modifying the `mailOptions.html` content. The template includes:
- Sobhagya branding and colors
- Professional layout with sections
- Timestamp in Indian timezone
- Reply-to functionality
- Mobile-responsive design
