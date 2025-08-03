# Google Wallet Digital Pass App

A simple web application to create and add digital passes to Google Wallet. This app creates hotel/guest passes based on the provided genericObject structure.

## Features

- Real-time pass preview
- Form validation
- Responsive design
- Google Wallet integration
- QR code support

## Setup Instructions

### 1. Prerequisites

- Node.js (v14 or higher)
- Google Cloud Platform account
- Google Wallet API access

### 2. Google Wallet API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Wallet API
4. Create a service account:
   - Go to IAM & Admin > Service Accounts
   - Click "Create Service Account"
   - Download the JSON key file
5. Get your Issuer ID from the Google Wallet Console

### 3. Installation

```bash
# Clone or navigate to the project directory
cd google-wallet-app

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### 4. Configuration

Edit the `.env` file with your credentials:

```env
ISSUER_ID=your_issuer_id_here
SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
PORT=3000
```

**Important**: 
- Get the `ISSUER_ID` from Google Wallet Console
- Get `SERVICE_ACCOUNT_EMAIL` and `PRIVATE_KEY` from your service account JSON file
- Keep the `\n` characters in the private key

### 5. Running the Application

#### Option A: Using Docker (Recommended)

```bash
# Quick setup
./docker-setup.sh

# Start in production mode
make up

# Start in development mode (with hot reload)
make dev-up

# View logs
make logs

# Stop the application
make down
```

#### Option B: Using Node.js directly

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The app will be available at `http://localhost:3000`

## Docker Commands

| Command | Description |
|---------|-------------|
| `make build` | Build production Docker image |
| `make up` | Start production container |
| `make down` | Stop containers |
| `make logs` | View container logs |
| `make dev-up` | Start development container |
| `make dev-down` | Stop development container |
| `make shell` | Access container shell |
| `make clean` | Remove all containers and images |
| `make help` | Show all available commands |

## Usage

1. Open the web app in your browser
2. Fill out the guest information form
3. See the real-time preview of your pass
4. Click "Create Google Wallet Pass"
5. Click "Add to Google Wallet" to save the pass

## Pass Structure

The app creates passes with the following information:
- Guest name and type
- Unit name and room number
- Check-in/Check-out dates
- Parking slot
- Pet and amenities permissions
- QR code for verification

## API Endpoints

- `GET /` - Main application page
- `POST /create-pass` - Create a new Google Wallet pass

## Customization

You can customize the pass appearance by modifying:
- `server.js` - Pass structure and colors
- `public/styles.css` - UI styling
- `public/script.js` - Form behavior

## Troubleshooting

### Common Issues

1. **"Invalid credentials" error**
   - Check your service account JSON file
   - Ensure the private key includes `\n` characters
   - Verify the service account has proper permissions

2. **"Issuer not found" error**
   - Verify your ISSUER_ID is correct
   - Make sure you've set up the issuer in Google Wallet Console

3. **Pass not appearing in wallet**
   - Check that the save URL is properly formatted
   - Ensure you're testing on a supported device/browser
   - Verify the pass object structure is valid

### Debug Mode

The app includes debug information in the success response. Check the browser console for detailed error messages.

## Security Notes

- Never commit your `.env` file to version control
- Keep your service account credentials secure
- Use HTTPS in production
- Validate all user inputs

## License

MIT License
