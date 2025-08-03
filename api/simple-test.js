// Simple test without external dependencies
export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const userData = req.body;
  
  // Simple validation - using correct field names
  if (!userData || !userData.guestName || !userData.room) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: guestName and room are required',
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
