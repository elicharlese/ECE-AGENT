# Environment Configuration

This directory contains environment configuration files for different deployment contexts.

## Files

- `.env.example` - Template with all required environment variables
- `.env.production.local` - Production-specific environment variables
- `.env.training` - Training and ML-specific environment variables  
- `.env.vercel.production` - Vercel deployment configuration

## Usage

Copy `.env.example` to `.env.local` in the project root for local development:

```bash
cp config/env/.env.example .env.local
```

## Note

`.env.local` remains in the project root as required by Next.js conventions.
