#!/bin/bash

# Example usage of the admin password update script
# This script demonstrates how to update the admin password

echo "🔐 LedgerOne Admin Password Update Example"
echo "=========================================="
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found"
    echo "Please create a .env file with your Supabase credentials:"
    echo ""
    echo "NEXT_PUBLIC_SUPABASE_URL=your_supabase_url"
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key"
    echo ""
    exit 1
fi

echo "✅ .env file found"
echo ""

# Example 1: Update with a strong password
echo "📝 Example 1: Update with a strong password"
echo "Command: npm run update-admin-password \"MySecurePassword123!\""
echo ""

# Example 2: Update with another strong password
echo "📝 Example 2: Update with another strong password"
echo "Command: npm run update-admin-password \"Admin2024#Secure\""
echo ""

# Example 3: Direct node execution
echo "📝 Example 3: Direct node execution"
echo "Command: node scripts/update-admin-password.js \"YourCustomPassword456!\""
echo ""

echo "⚠️  Important Security Notes:"
echo "   - Use strong passwords with uppercase, lowercase, numbers, and symbols"
echo "   - Keep your password secure and don't share it"
echo "   - Consider updating the password periodically"
echo "   - Make sure you're in a secure environment when running this script"
echo ""

echo "🚀 To update your admin password, run one of the commands above"
echo "   with your desired password as the argument." 