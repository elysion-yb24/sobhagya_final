# Sample Data Removal Guide

This guide explains how to remove sample data when your backend is ready.

## Quick Removal (Recommended)

When your backend is ready, simply change one line in the configuration:

### 1. Open `app/config/development.ts`

### 2. Change this line:
```typescript
USE_SAMPLE_DATA: true,
```

### 3. To this:
```typescript
USE_SAMPLE_DATA: false,
```

That's it! The application will now automatically fetch from your backend instead of using sample data.

## What This Does

When `USE_SAMPLE_DATA` is set to `false`:

- ✅ **All sample data is bypassed** - No sample data will be loaded
- ✅ **Backend API calls work normally** - All fetch functions will use your backend
- ✅ **Development banner disappears** - No more "DEVELOPMENT MODE" banner
- ✅ **Debug logs are disabled** - Cleaner console output
- ✅ **No code changes needed** - Everything works automatically

## Files That Use Sample Data

The following files are configured to use sample data when `USE_SAMPLE_DATA: true`:

### Profile Pages
- `app/astrologers/[id]/page.tsx`
- `app/call-with-astrologer/profile/[id]/page.tsx`
- `app/consult-astrologer/profile/[id]/page.tsx`

### List Pages
- `app/astrologers/page.tsx`
- `app/call-with-astrologer/page.tsx`

### Components
- `app/components/astrologers/AstrologerCard.tsx`
- `app/components/astrologers/AstrologerList.tsx`

## Sample Data Files (Can be deleted after removal)

These files contain sample data and can be safely deleted after setting `USE_SAMPLE_DATA: false`:

- `app/data/sampleAstrologers.ts`
- `app/data/sampleAstrologerProfiles.ts`
- `app/components/DevModeBanner.tsx`

## Configuration Options

In `app/config/development.ts`, you can control:

```typescript
export const DEVELOPMENT_CONFIG = {
  // Set to false when backend is ready
  USE_SAMPLE_DATA: true,
  
  // Hide development banner
  SHOW_DEV_BANNER: true,
  
  // Disable debug console logs
  ENABLE_DEBUG_LOGS: true,
} as const;
```

## Testing After Removal

After setting `USE_SAMPLE_DATA: false`, test these URLs with real backend data:

- `http://localhost:3000/astrologers/[real-astrologer-id]`
- `http://localhost:3000/call-with-astrologer/profile/[real-astrologer-id]`
- `http://localhost:3000/astrologers` (astrologer list)

## Troubleshooting

If you encounter issues after removing sample data:

1. **Check backend connectivity** - Ensure your backend is running
2. **Verify API endpoints** - Check that your backend endpoints match the expected format
3. **Check authentication** - Ensure proper authentication tokens are being sent
4. **Review console logs** - Look for API errors in browser console

## Rollback

If you need to temporarily re-enable sample data for testing:

1. Set `USE_SAMPLE_DATA: true` in `app/config/development.ts`
2. Restart your development server
3. Sample data will be available again

---

**Note**: This system is designed to make the transition from sample data to backend data seamless. No code changes are required beyond the configuration file.
