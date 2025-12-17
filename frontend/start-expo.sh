#!/bin/bash

# Script to start Expo with cleared cache (for mobile testing)

echo "🚀 Starting Expo with cleared cache..."
echo "📱 Make sure your phone and computer are on the same Wi-Fi network"
echo "🌐 Using IP: 192.168.29.15"
echo ""
echo "Press Ctrl+C to stop"
echo ""

npx expo start --clear
