import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '../../../../config/api';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Authentication required', data: [] },
        { status: 401, headers: corsHeaders }
      );
    }

    const targetUrl = `${getApiBaseUrl()}/calling/api/gift/get-gifts`;
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
    });

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status, headers: corsHeaders });
  } catch (error) {
    console.error('Proxy error in get-gifts:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch gifts', data: [] },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}
