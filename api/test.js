export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  const envCheck = {
    ISSUER_ID: process.env.ISSUER_ID ? '✅ Set' : '❌ Missing',
    SERVICE_ACCOUNT_EMAIL: process.env.SERVICE_ACCOUNT_EMAIL ? '✅ Set' : '❌ Missing',
    PRIVATE_KEY: process.env.PRIVATE_KEY ? '✅ Set' : '❌ Missing',
    NODE_ENV: process.env.NODE_ENV || 'not set',
    VERCEL_URL: process.env.VERCEL_URL || 'not set'
  };
  
  res.status(200).json({
    message: 'Environment check',
    environment: envCheck,
    timestamp: new Date().toISOString()
  });
};
