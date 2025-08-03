// Simple test without external dependencies
export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const userData = req.body;
  
  // Simple validation
  if (!userData || !userData.guestName || !userData.unitName) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields',
      received: userData,
      timestamp: new Date().toISOString()
    });
  }
  
  // Return success without creating JWT (for testing)
  res.status(200).json({
    success: true,
    message: 'Data received successfully',
    data: userData,
    timestamp: new Date().toISOString()
  });
}
