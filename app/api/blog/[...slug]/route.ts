import { NextResponse, NextRequest } from 'next/server';
import { getApiBaseUrl } from '../../../config/api';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams.toString();
    const apiBaseUrl = getApiBaseUrl();
    
    // Construct the path: Remove /api/blog from the original path and prepend /user/api/blog
    // url.pathname is e.g. /api/blog/admin/get-blogs
    const cleanPath = url.pathname.startsWith('/api/blog') 
      ? url.pathname.substring(9) 
      : url.pathname;
    
    const targetUrl = `${apiBaseUrl}/user/api/blog${cleanPath}${searchParams ? '?' + searchParams : ''}`;

    console.log('[blog-proxy] Forwarding GET to:', targetUrl);

    // Forward relevant headers
    const forwardHeaders: Record<string, string> = {
      'Accept': 'application/json',
    };
    
    const authHeader = req.headers.get('authorization');
    if (authHeader) forwardHeaders['Authorization'] = authHeader;
    
    const cookieHeader = req.headers.get('cookie') || req.headers.get('cookies');
    if (cookieHeader) forwardHeaders['Cookie'] = cookieHeader;

    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: forwardHeaders,
    });

    const contentType = res.headers.get('content-type') || '';
    const text = await res.text();
    
    let data;
    if (contentType.includes('application/json')) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('[blog-proxy] JSON parse error:', e);
        data = { success: false, message: 'Invalid JSON response from backend', raw: text.substring(0, 200) };
      }
    } else {
      console.warn('[blog-proxy] Received non-JSON response:', contentType);
      data = { 
        success: false, 
        message: 'Backend returned non-JSON response', 
        contentType,
        snippet: text.substring(0, 200) 
      };
    }

    return NextResponse.json(data, { 
      status: res.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  } catch (err: any) {
    console.error('[blog-proxy] Fatal error:', err);
    return NextResponse.json({ 
      success: false, 
      message: 'Blog proxy communication failure',
      error: err.message
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
