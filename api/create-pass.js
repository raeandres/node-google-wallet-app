const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Configuration
const ISSUER_ID = process.env.ISSUER_ID;
const SERVICE_ACCOUNT_EMAIL = process.env.SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Create generic object for Google Wallet
function createGenericObject(userData) {
  const objectId = `${ISSUER_ID}.${uuidv4()}`;
  
  return {
    id: objectId,
    classId: `${ISSUER_ID}.digital_door_pass`,
    genericType: 'GENERIC_TYPE_UNSPECIFIED',
    hexBackgroundColor: '#4285f4',
    logo: {
      sourceUri: {
        uri: 'https://storage.googleapis.com/wallet-lab-tools-codelab-artifacts-public/pass_google_logo.jpg'
      },
      contentDescription: {
        defaultValue: {
          language: 'en-US',
          value: 'Hotel Logo'
        }
      }
    },
    cardTitle: {
      defaultValue: {
        language: 'en-US',
        value: 'Hotel Guest Pass'
      }
    },
    subheader: {
      defaultValue: {
        language: 'en-US',
        value: userData.guestType === 'guest' ? 'Guest Access' : 'Resident Access'
      }
    },
    header: {
      defaultValue: {
        language: 'en-US',
        value: userData.guestName || 'Guest'
      }
    },
    textModulesData: [
      {
        id: 'unit',
        header: 'Unit',
        body: userData.unit || 'N/A'
      },
      {
        id: 'room',
        header: 'Room',
        body: userData.room || 'N/A'
      },
      {
        id: 'checkin',
        header: 'Check-in',
        body: userData.checkIn || 'N/A'
      },
      {
        id: 'checkout',
        header: 'Check-out',
        body: userData.checkOut || 'N/A'
      },
      {
        id: 'parking',
        header: 'Parking',
        body: userData.parking || 'Not assigned'
      },
      {
        id: 'companions',
        header: 'Companions',
        body: userData.companions || '0'
      },
      {
        id: 'pets',
        header: 'Pets Allowed',
        body: userData.pet || 'No'
      },
      {
        id: 'amenities',
        header: 'Amenities Access',
        body: userData.amenities || 'No'
      }
    ],
    barcode: {
      type: 'QR_CODE',
      value: userData.barcodeValue || `GUEST:${userData.guestName}:ROOM:${userData.room}:${Date.now()}`,
      alternateText: userData.guestName || 'Guest Pass'
    },
    heroImage: {
      sourceUri: {
        uri: 'https://storage.googleapis.com/wallet-lab-tools-codelab-artifacts-public/google-io-hero-demo-only.jpg'
      },
      contentDescription: {
        defaultValue: {
          language: 'en-US',
          value: 'Hotel Image'
        }
      }
    }
  };
}

// Create JWT for Google Wallet
function createJWT(payload) {
  const claims = {
    iss: SERVICE_ACCOUNT_EMAIL,
    aud: 'google',
    origins: [
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://your-app.vercel.app',
      'http://localhost:3000'
    ],
    typ: 'savetowallet',
    payload: payload
  };

  // Process the private key to handle escaped newlines
  let processedPrivateKey = PRIVATE_KEY;
  if (typeof processedPrivateKey === 'string') {
    processedPrivateKey = processedPrivateKey.replace(/\\n/g, '\n');
  }
  
  try {
    const token = jwt.sign(claims, processedPrivateKey, { algorithm: 'RS256' });
    return token;
  } catch (error) {
    throw new Error(`Failed to create JWT token: ${error.message}`);
  }
}

// Vercel API handler - MUST use export default
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed. Use POST.' 
    });
  }

  try {
    // Check environment variables first
    if (!ISSUER_ID || !SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY) {
      throw new Error('Missing required environment variables. Please check ISSUER_ID, SERVICE_ACCOUNT_EMAIL, and PRIVATE_KEY in Vercel settings.');
    }

    const userData = req.body;
    console.log('📋 Raw request body:', JSON.stringify(req.body, null, 2));
    console.log('📋 User data type:', typeof userData);
    console.log('📋 User data keys:', userData ? Object.keys(userData) : 'No keys');
    
    // Validate required fields
    if (!userData || typeof userData !== 'object') {
      throw new Error('Invalid request body. Expected JSON object.');
    }
    
    if (!userData.guestName || !userData.room) {
      console.log('❌ Missing fields - guestName:', userData.guestName, 'room:', userData.room);
      throw new Error('Missing required fields: guestName and room are required');
    }
    
    // Create the generic object
    const genericObject = createGenericObject(userData);
    
    // Create JWT
    const payload = {
      genericObjects: [genericObject]
    };
    
    const token = createJWT(payload);
    const saveUrl = `https://pay.google.com/gp/v/save/${token}`;
    
    // Ensure we return JSON
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      success: true,
      saveUrl: saveUrl,
      object: genericObject
    });
    
  } catch (error) {
    console.error('❌ Error creating pass:', error.message);
    
    // Ensure we return JSON even on error
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
