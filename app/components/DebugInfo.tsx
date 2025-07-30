"use client";

import { useEffect, useState } from 'react';
import { getApiBaseUrl } from '../config/api';
import { checkApiHealth, logApiConfiguration } from '../utils/api-health-check';

export default function DebugInfo() {
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const loadDebugInfo = async () => {
      logApiConfiguration();
      
      const info = {
        nodeEnv: process.env.NODE_ENV,
        apiBaseUrl: getApiBaseUrl(),
        nextPublicApiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        apiHealth: await checkApiHealth(),
      };
      
      setDebugInfo(info);
      console.log('Debug Info:', info);
    };
    
    loadDebugInfo();
  }, []);

  // Only show in development or when explicitly enabled
  if (process.env.NODE_ENV !== 'development' && !process.env.NEXT_PUBLIC_DEBUG) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <pre className="whitespace-pre-wrap">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  );
} 