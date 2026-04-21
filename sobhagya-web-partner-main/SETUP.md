# Quick Setup Guide

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Create Environment File
Create `.env.local` in the root directory:

**If using Nginx (Recommended):**
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost
NEXT_PUBLIC_USE_NGINX=true
```

**If accessing services directly (Development):**
```env
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:3001/api
NEXT_PUBLIC_USER_SERVICE_URL=http://localhost:4001/api
NEXT_PUBLIC_PAYMENT_SERVICE_URL=http://localhost:6001/api
NEXT_PUBLIC_USE_NGINX=false
```

**Backend Service Ports:**
- Auth Service: 3001
- User Service: 4001
- Payment Service: 6001 (docker) or 3000 (default)

## Step 3: Start Development Server
```bash
npm run dev
```

## Step 4: Access the Portal
Open [http://localhost:3000](http://localhost:3000)

## Backend CORS Configuration

The backend already exposes the `auth-token` header in responses (configured in middleware). The frontend is configured to:
- Send access token as `Authorization: Bearer <token>` header
- Send refresh token via cookies (handled automatically by axios with `withCredentials: true`)
- Receive and store new access tokens from response headers

**CORS Whitelist:**
The backend CORS whitelist includes `http://localhost:3000`. If you run Next.js on a different port, you may need to update the backend CORS configuration in:
- `auth-service/src/app.js`
- `user-service/src/app.js`
- `payment-service/src/app.js`

## Testing the Portal

1. **Login**: Enter your phone number and verify OTP
2. **Dashboard**: You should see:
   - Your profile information
   - Status toggle (Online/Offline)
   - Call settings (Video/Audio)
   - Wallet balance and earnings
   - Transaction history

## Troubleshooting

### "Failed to fetch" errors
- Check that backend services are running
- Verify `NEXT_PUBLIC_API_BASE_URL` is correct
- Check browser console for CORS errors

### Authentication not working
- Clear browser localStorage and cookies
- Check Network tab to see if `auth-token` header is being received
- Verify backend auth service is running on correct port

### Data not updating
- Check browser console for API errors
- Verify all backend services are running
- Check that the user has proper permissions

