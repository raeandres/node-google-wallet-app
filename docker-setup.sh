#!/bin/bash

# Google Wallet App Docker Setup Script

set -e

echo "🐳 Setting up Google Wallet App with Docker..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "📝 Please edit .env file with your actual credentials before running the app."
    else
        echo "❌ .env.example file not found. Please create .env file manually."
        exit 1
    fi
fi

# Build the Docker image
echo "🏗️  Building Docker image..."
docker-compose build

echo "✅ Docker setup complete!"
echo ""
echo "🚀 To start the application:"
echo "   Production: make up"
echo "   Development: make dev-up"
echo ""
echo "📋 Other useful commands:"
echo "   make help - Show all available commands"
echo "   make logs - View application logs"
echo "   make shell - Access container shell"
echo ""
echo "🌐 The app will be available at: http://localhost:3000"
