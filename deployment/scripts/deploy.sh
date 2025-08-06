#!/bin/bash
# Enhanced AGENT System - Vercel Deployment Script
# Deploys the system to Vercel with comprehensive error checking

echo "🚀 Enhanced AGENT System - Vercel Deployment"
echo "=============================================="

# Pre-deployment validation
echo "🔍 Running pre-deployment validation..."
if ! ./deploy-check.sh; then
    echo "❌ Pre-deployment validation failed"
    exit 1
fi

echo ""
echo "🌐 Starting Vercel deployment..."
echo ""

# Check if logged in to Vercel
if ! vercel whoami >/dev/null 2>&1; then
    echo "🔐 Not logged in to Vercel. Please login first:"
    echo "   vercel login"
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo "✅ Logged in to Vercel"

# Show current configuration
echo ""
echo "📋 Deployment Configuration:"
echo "   • Project: Enhanced AGENT System"
echo "   • Runtime: Python 3.9"
echo "   • Framework: FastAPI"
echo "   • Static Files: Included"
echo "   • API Endpoints: 6 configured"
echo "   • Dependencies: $(wc -l < requirements-vercel.txt) packages"
echo ""

# Confirm deployment
read -p "🚀 Deploy to production? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Deploy to production
echo "🚀 Deploying to Vercel production..."
if vercel --prod --yes; then
    echo ""
    echo "🎉 DEPLOYMENT SUCCESSFUL!"
    echo "========================"
    echo ""
    echo "Your Enhanced AGENT System is now live!"
    echo ""
    echo "📊 Check deployment status:"
    echo "   vercel ls"
    echo ""
    echo "🌐 View your deployment:"
    echo "   vercel --prod"
    echo ""
    echo "📖 API Documentation will be available at:"
    echo "   https://your-deployment-url.vercel.app/docs"
    echo ""
    echo "🔍 Monitor your deployment:"
    echo "   https://your-deployment-url.vercel.app/health"
    echo ""
else
    echo ""
    echo "❌ DEPLOYMENT FAILED"
    echo "==================="
    echo ""
    echo "Please check the error messages above and:"
    echo "1. Ensure all files are committed to git"
    echo "2. Check vercel.json configuration"
    echo "3. Verify requirements-vercel.txt"
    echo "4. Run './deploy-check.sh' again"
    echo ""
    exit 1
fi
