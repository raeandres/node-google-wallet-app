require('dotenv').config();
const express = require('express');
const path = require('path');
const { GoogleAuth } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Configuration - You'll need to set these
const ISSUER_ID = process.env.ISSUER_ID || 'YOUR_ISSUER_ID';
const SERVICE_ACCOUNT_EMAIL = process.env.SERVICE_ACCOUNT_EMAIL || 'YOUR_SERVICE_ACCOUNT_EMAIL';
const PRIVATE_KEY = process.env.PRIVATE_KEY || 'YOUR_PRIVATE_KEY';

// Validate private key format
function validatePrivateKey(key) {
  if (!key || key === 'YOUR_PRIVATE_KEY') {
    console.error('❌ PRIVATE_KEY is not set in environment variables');
    return false;
  }
  
  const processedKey = key.replace(/\\n/g, '\n');
  
  if (!processedKey.includes('-----BEGIN PRIVATE KEY-----') || 
      !processedKey.includes('-----END PRIVATE KEY-----')) {
    console.error('❌ PRIVATE_KEY does not appear to be a valid RSA private key');
    console.error('Make sure it starts with -----BEGIN PRIVATE KEY----- and ends with -----END PRIVATE KEY-----');
    return false;
  }
  
  console.log('✅ Private key format appears valid');
  return true;
}

// Validate configuration on startup
if (!validatePrivateKey(PRIVATE_KEY)) {
  console.error('Please check your .env file and ensure PRIVATE_KEY is properly set');
}

// Google Wallet API configuration
const baseUrl = 'https://walletobjects.googleapis.com/walletobjects/v1';

// Create generic class (you'll need to do this once)
async function createGenericClass() {
  const classId = `${ISSUER_ID}.digital_door_pass`;
  
  const genericClass = {
    id: classId,
    classTemplateInfo: {
      cardTemplateOverride: {
        cardRowTemplateInfos: [
          {
            twoItems: {
              startItem: {
                firstValue: {
                  fields: [
                    {
                      fieldPath: "object.textModulesData['unit']"
                    }
                  ]
                }
              },
              endItem: {
                firstValue: {
                  fields: [
                    {
                      fieldPath: "object.textModulesData['room']"
                    }
                  ]
                }
              }
            }
          },
          {
            twoItems: {
              startItem: {
                firstValue: {
                  fields: [
                    {
                      fieldPath: "object.textModulesData['check-in']"
                    }
                  ]
                }
              },
              endItem: {
                firstValue: {
                  fields: [
                    {
                      fieldPath: "object.textModulesData['check-out']"
                    }
                  ]
                }
              }
            }
          },
          {
            twoItems: {
              startItem: {
                firstValue: {
                  fields: [
                    {
                      fieldPath: "object.textModulesData['parking']"
                    }
                  ]
                }
              },
              endItem: {
                firstValue: {
                  fields: [
                    {
                      fieldPath: "object.textModulesData['companions']"
                    }
                  ]
                }
              }
            }
          },
          {
            twoItems: {
              startItem: {
                firstValue: {
                  fields: [
                    {
                      fieldPath: "object.textModulesData['pet']"
                    }
                  ]
                }
              },
              endItem: {
                firstValue: {
                  fields: [
                    {
                      fieldPath: "object.textModulesData['amenities']"
                    }
                  ]
                }
              }
            }
          }
        ]
      }
    }
  };

  return genericClass;
}

// Create generic object
function createGenericObject(userData) {
  const objectId = `${ISSUER_ID}.${uuidv4()}`;
  
  return {
    id: objectId,
    classId: `${ISSUER_ID}.digital_door_pass`,
    logo: {
      sourceUri: {
        uri: "https://storage.googleapis.com/wallet-lab-tools-codelab-artifacts-public/pass_google_logo.jpg"
      },
      contentDescription: {
        defaultValue: {
          language: "en-US",
          value: "Digital Door PH Logo"
        }
      }
    },
    cardTitle: {
      defaultValue: {
        language: "en-US",
        value: "Digital Door PH"
      }
    },
    subheader: {
      defaultValue: {
        language: "en-US",
        value: userData.guestType || "Guest"
      }
    },
    header: {
      defaultValue: {
        language: "en-US",
        value: userData.guestName || "Guest Name"
      }
    },
    textModulesData: [
      {
        id: "unit",
        header: "Unit",
        body: userData.unit || "N/A"
      },
      {
        id: "room",
        header: "Room",
        body: userData.room || "N/A"
      },
      {
        id: "check-in",
        header: "Check-in",
        body: userData.checkIn || "N/A"
      },
      {
        id: "check-out",
        header: "Check-out",
        body: userData.checkOut || "N/A"
      },
      {
        id: "parking",
        header: "Parking",
        body: userData.parking || "N/A"
      },
      {
        id: "companions",
        header: "Companions",
        body: userData.companions || "0"
      },
      {
        id: "pet",
        header: "Pet",
        body: userData.pet || "NO"
      },
      {
        id: "amenities",
        header: "Amenities",
        body: userData.amenities || "NO"
      }
    ],
    barcode: {
      type: "QR_CODE",
      value: userData.barcodeValue || `GUEST_${Date.now()}`,
      alternateText: "Please show this to concierge"
    },
    hexBackgroundColor: "#518849"
  };
}

// Create JWT for Google Wallet
function createJWT(payload) {
  const claims = {
    iss: SERVICE_ACCOUNT_EMAIL,
    aud: 'google',
    origins: [
      'http://localhost:3000', 
      'http://192.168.0.118:3000',
      'https://your-domain.com'
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
    return jwt.sign(claims, processedPrivateKey, { algorithm: 'RS256' });
  } catch (error) {
    console.error('❌ JWT signing failed:', error.message);
    console.error('Private key length:', processedPrivateKey.length);
    console.error('Private key starts with:', processedPrivateKey.substring(0, 50));
    console.error('Private key ends with:', processedPrivateKey.substring(processedPrivateKey.length - 50));
    throw new Error('Failed to create JWT token. Check your private key format.');
  }
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/create-pass', async (req, res) => {
  try {
    const userData = req.body;
    
    // Create the generic object
    const genericObject = createGenericObject(userData);
    
    // Create JWT
    const payload = {
      genericObjects: [genericObject]
    };
    
    const token = createJWT(payload);
    const saveUrl = `https://pay.google.com/gp/v/save/${token}`;
    
    res.json({
      success: true,
      saveUrl: saveUrl,
      object: genericObject
    });
  } catch (error) {
    console.error('Error creating pass:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on:`);
  console.log(`  - Local:   http://localhost:${PORT}`);
  console.log(`  - Network: http://192.168.0.118:${PORT}`);
  console.log('');
  console.log('Make sure to set your environment variables:');
  console.log('- ISSUER_ID');
  console.log('- SERVICE_ACCOUNT_EMAIL');
  console.log('- PRIVATE_KEY');
});
