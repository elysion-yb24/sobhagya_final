// Next.js API route that proxies to backend server
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the authorization header from the request
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header required' });
    }

    // Proxy the request to your backend server
    const backendUrl = 'http://localhost:8001/payment/api/transaction/wallet-page-data';
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        // Forward any other relevant headers
        ...(req.headers['user-agent'] && { 'User-Agent': req.headers['user-agent'] }),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'Backend API error',
        status: response.status,
        message: errorText
      });
    }

    const data = await response.json();
    
    // Return the data from your backend
    res.status(200).json(data);
    
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
} 