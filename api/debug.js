export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  console.log('Debug endpoint called');
  console.log('Method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('Body type:', typeof req.body);
  
  res.status(200).json({
    method: req.method,
    headers: req.headers,
    body: req.body,
    bodyType: typeof req.body,
    timestamp: new Date().toISOString()
  });
}
