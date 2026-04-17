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
    const cookieHeader = request.headers.get('cookie');
    const body = await request.json();

    if (!authHeader && !cookieHeader) {
      return NextResponse.json(
        { success: false, message: 'Authorization required' },
        { status: 401, headers: corsHeaders }
      );
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authHeader) headers['Authorization'] = authHeader;
    if (cookieHeader) headers['Cookie'] = cookieHeader;

    let targetUrl = `${getApiBaseUrl()}/payment/api/transaction/phonepe/initiate`;
    if (authHeader) {
      const tokenMatch = authHeader.match(/Bearer (.+)/);
      if (tokenMatch) {
        const qp = new URLSearchParams({ token: tokenMatch[1] });
        targetUrl += `?${qp.toString()}`;
      }
    }

    console.log('[phonepe/initiate] forwarding to:', targetUrl);

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    const data = await response.json();
    console.log('[phonepe/initiate] backend response:', response.status, data);

    return NextResponse.json(data, { status: response.status, headers: corsHeaders });
  } catch (error) {
    console.error('[phonepe/initiate] proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to initiate PhonePe payment' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}
