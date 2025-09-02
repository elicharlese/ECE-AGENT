# Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Configuration
```bash
# Required environment variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-secret
NEXT_PUBLIC_LIVEKIT_WS_URL=wss://your-livekit-instance.livekit.cloud

# Optional but recommended
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
GOOGLE_SITE_VERIFICATION=your-verification-code
```

### 2. Production Readiness Check
```bash
# Run comprehensive production check
pnpm run production-check

# Individual checks
pnpm run typecheck
pnpm run lint
pnpm run test:ci
pnpm run build
```

### 3. Security Audit
```bash
# Check for vulnerabilities
pnpm audit --audit-level moderate

# Update dependencies if needed
pnpm update
```

## Deployment Platforms

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main


### Docker Deployment
```dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS build
COPY . .
RUN npm run build

FROM base AS runtime
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["npm", "start"]
```

## Performance Optimization

### 1. Bundle Analysis
```bash
# Analyze bundle size
pnpm run build:analyze
```

### 2. Image Optimization
- Use Next.js `<Image />` component
- Optimize images before upload
- Consider CDN for static assets

### 3. Database Optimization
- Enable connection pooling
- Set up read replicas if needed
- Monitor query performance

## Monitoring & Analytics

### 1. Error Tracking
- Sentry integration for error monitoring
- Custom error boundaries in place
- Comprehensive logging

### 2. Performance Monitoring
- Web Vitals tracking
- Real User Monitoring (RUM)
- Server-side performance metrics

### 3. Analytics
- User behavior tracking
- Conversion funnel analysis
- A/B testing setup

## Security Considerations

### 1. Authentication
- Supabase RLS policies enabled
- JWT token validation
- Session management

### 2. API Security
- Rate limiting implemented
- Input validation with Zod
- CORS configuration

### 3. Data Protection
- Environment variables secured
- Database encryption at rest
- HTTPS enforced

## Backup & Recovery

### 1. Database Backups
- Automated daily backups via Supabase
- Point-in-time recovery available
- Backup verification process

### 2. Code Backups
- Git repository with multiple remotes
- Tagged releases for rollback
- CI/CD pipeline with rollback capability

## Scaling Considerations

### 1. Horizontal Scaling
- Stateless application design
- Load balancer configuration
- Auto-scaling policies

### 2. Database Scaling
- Connection pooling (PgBouncer)
- Read replicas for read-heavy workloads
- Caching layer (Redis)

### 3. CDN & Caching
- Static asset caching
- API response caching
- Edge computing for global users

## Post-Deployment

### 1. Health Checks
```bash
# Verify deployment
curl -f https://your-domain.com/api/health

# Check database connectivity
curl -f https://your-domain.com/api/db-health
```

### 2. Monitoring Setup
- Set up alerts for errors
- Monitor performance metrics
- Track user engagement

### 3. Documentation
- Update API documentation
- User guides and tutorials
- Internal runbooks

## Troubleshooting

### Common Issues
1. **Build Failures**: Check TypeScript errors and dependencies
2. **Environment Variables**: Verify all required vars are set
3. **Database Connection**: Check connection strings and network access
4. **Authentication**: Verify Supabase configuration and RLS policies

### Debug Commands
```bash
# Check logs
pnpm run build 2>&1 | tee build.log

# Test database connection
node -e "console.log(process.env.DATABASE_URL ? 'DB URL set' : 'DB URL missing')"

# Verify environment
node scripts/production-check.js
```

## Rollback Procedure

1. **Immediate Rollback**
   ```bash
   # Revert to previous deployment
   git revert HEAD
   git push origin main
   ```

2. **Database Rollback**
   - Use Supabase point-in-time recovery
   - Restore from backup if needed

3. **Verification**
   - Run health checks
   - Verify core functionality
   - Monitor error rates

## Support & Maintenance

### Regular Tasks
- Weekly dependency updates
- Monthly security audits
- Quarterly performance reviews

### Emergency Contacts
- DevOps team: [contact info]
- Database admin: [contact info]
- Security team: [contact info]
