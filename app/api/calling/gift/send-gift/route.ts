import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '../../../../config/api';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Authentication required', data: null },
        { status: 401, headers: corsHeaders }
      );
    }

    const body = await request.json().catch(() => ({}));

    const targetUrl = `${getApiBaseUrl()}/calling/api/gift/send-gift`;
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status, headers: corsHeaders });
  } catch (error) {
    console.error('Proxy error in send-gift:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send gift', data: null },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}
