import { NextRequest, NextResponse } from 'next/server';

// Since this is client-side storage (localStorage), we'll return instructions
// For production, this should be stored in a backend database
export async function GET(request: NextRequest) {
  try {
    // Note: localStorage is client-side only
    // In a real implementation, this would fetch from a backend database
    // For now, we return a message indicating data should be fetched client-side
    
    return NextResponse.json({
      success: true,
      message: 'Kundli history is stored in localStorage. Use the client-side functions from @/lib/storage to access it.',
      note: 'For production, implement backend storage and fetch from database here'
    });
  } catch (error: any) {
    console.error('Error in Kundli history API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Kundli history', details: error.message },
      { status: 500 }
    );
  }
}

