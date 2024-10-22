// pages/api/your-endpoint.ts

import { handleAuth } from '@kinde-oss/kinde-auth-nextjs/server';
import { NextApiRequest, NextApiResponse } from 'next';

export const GET = handleAuth((req: NextApiRequest, res: NextApiResponse) => {
  // Set CORS headers
  res.setHeader(
    'Access-Control-Allow-Origin',
    process.env.CORS_ALLOWED_ORIGINS || '*',
  ); // Allow any origin
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS',
  ); // Allowed methods
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'); // Allowed headers

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // End the request for preflight
  }

  // Your normal response logic
  return new Response('Hello, Next.js!', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
});
