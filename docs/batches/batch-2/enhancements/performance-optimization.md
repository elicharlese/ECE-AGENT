# Performance Optimization Guide - Batch 2

## Current Performance Baseline
- Initial Load Time: ~3.5s
- Time to Interactive: ~4.2s
- Bundle Size: ~450KB
- API Response Time: ~200ms average
- Memory Usage: ~85MB

## Target Metrics
- Initial Load Time: < 1.5s
- Time to Interactive: < 2s
- Bundle Size: < 250KB
- API Response Time: < 50ms
- Memory Usage: < 50MB

## Optimization Strategies

### 1. Bundle Optimization

#### Code Splitting
```typescript
// app/layout.tsx
const MessagesLayout = dynamic(() => import('@/components/messages/imessage-layout'), {
  loading: () => <MessageSkeleton />,
  ssr: false
});

const AgentSidebar = dynamic(() => import('@/components/ai/enhanced-agent-sidebar'), {
  loading: () => <SidebarSkeleton />,
  ssr: false
});
```

#### Tree Shaking
```typescript
// next.config.mjs
module.exports = {
  webpack: (config, { dev, isServer }) => {
    config.optimization = {
      ...config.optimization,
      usedExports: true,
      sideEffects: false,
      concatenateModules: true,
      minimize: !dev
    };
    return config;
  }
};
```

### 2. React Optimizations

#### Memoization Strategy
```typescript
// components/messages/message-item.tsx
export const MessageItem = memo(({ message, user }) => {
  const formattedTime = useMemo(
    () => formatTime(message.created_at),
    [message.created_at]
  );
  
  const reactions = useMemo(
    () => groupReactions(message.reactions),
    [message.reactions]
  );
  
  return (
    // Component JSX
  );
}, (prevProps, nextProps) => {
  return prevProps.message.id === nextProps.message.id &&
         prevProps.message.updated_at === nextProps.message.updated_at;
});
```

#### Virtual Scrolling
```typescript
// hooks/use-virtual-scroll.ts
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.ceil((scrollTop + containerHeight) / itemHeight);
    return { start, end };
  }, [scrollTop, itemHeight, containerHeight]);
  
  const visibleItems = useMemo(
    () => items.slice(visibleRange.start, visibleRange.end),
    [items, visibleRange]
  );
  
  return { visibleItems, setScrollTop, totalHeight: items.length * itemHeight };
}
```

### 3. Database Optimizations

#### Query Optimization
```sql
-- Add indexes for common queries
CREATE INDEX idx_messages_conversation_created 
ON messages(conversation_id, created_at DESC);

CREATE INDEX idx_conversations_user_updated 
ON conversation_participants(user_id, updated_at DESC);

-- Materialized view for conversation summaries
CREATE MATERIALIZED VIEW conversation_summaries AS
SELECT 
  c.id,
  c.title,
  COUNT(m.id) as message_count,
  MAX(m.created_at) as last_message_at,
  COUNT(m.id) FILTER (WHERE m.read = false) as unread_count
FROM conversations c
LEFT JOIN messages m ON c.id = m.conversation_id
GROUP BY c.id;
```

#### Connection Pooling
```typescript
// lib/supabase/pool.ts
class SupabasePool {
  private pool: SupabaseClient[] = [];
  private maxSize = 10;
  
  async acquire(): Promise<SupabaseClient> {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return createClient(url, key);
  }
  
  release(client: SupabaseClient): void {
    if (this.pool.length < this.maxSize) {
      this.pool.push(client);
    }
  }
}
```

### 4. Caching Strategy

#### React Query Implementation
```typescript
// hooks/use-conversations.ts
export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: fetchConversations,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchInterval: 30000 // 30 seconds
  });
}
```

#### Service Worker Caching
```javascript
// public/sw.js
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((response) => {
          return caches.open('api-cache-v1').then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
  }
});
```

### 5. Image Optimization

#### Next.js Image Component
```typescript
// components/ui/optimized-image.tsx
import Image from 'next/image';

export function OptimizedImage({ src, alt, ...props }) {
  return (
    <Image
      src={src}
      alt={alt}
      loading="lazy"
      placeholder="blur"
      blurDataURL={generateBlurDataURL(src)}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      {...props}
    />
  );
}
```

#### Progressive Image Loading
```typescript
// hooks/use-progressive-image.ts
export function useProgressiveImage(lowQualitySrc: string, highQualitySrc: string) {
  const [src, setSrc] = useState(lowQualitySrc);
  
  useEffect(() => {
    const img = new Image();
    img.src = highQualitySrc;
    img.onload = () => setSrc(highQualitySrc);
  }, [highQualitySrc]);
  
  return src;
}
```

### 6. Network Optimization

#### Request Batching
```typescript
// services/batch-service.ts
class BatchService {
  private queue: Request[] = [];
  private timer: NodeJS.Timeout | null = null;
  
  add(request: Request): Promise<Response> {
    return new Promise((resolve) => {
      this.queue.push({ ...request, resolve });
      this.scheduleBatch();
    });
  }
  
  private scheduleBatch() {
    if (this.timer) return;
    
    this.timer = setTimeout(() => {
      this.executeBatch();
      this.timer = null;
    }, 50); // 50ms debounce
  }
  
  private async executeBatch() {
    const batch = this.queue.splice(0);
    const responses = await fetch('/api/batch', {
      method: 'POST',
      body: JSON.stringify(batch)
    });
    
    batch.forEach((req, i) => {
      req.resolve(responses[i]);
    });
  }
}
```

### 7. Web Vitals Monitoring

#### Performance Observer
```typescript
// utils/performance-monitor.ts
export function initPerformanceMonitoring() {
  // Largest Contentful Paint
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log('LCP:', entry.startTime);
      trackMetric('lcp', entry.startTime);
    }
  }).observe({ entryTypes: ['largest-contentful-paint'] });
  
  // First Input Delay
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const fid = entry.processingStart - entry.startTime;
      console.log('FID:', fid);
      trackMetric('fid', fid);
    }
  }).observe({ entryTypes: ['first-input'] });
  
  // Cumulative Layout Shift
  let cls = 0;
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) {
        cls += entry.value;
        console.log('CLS:', cls);
        trackMetric('cls', cls);
      }
    }
  }).observe({ entryTypes: ['layout-shift'] });
}
```

## Implementation Checklist

### Phase 1: Quick Wins
- [ ] Enable Next.js production optimizations
- [ ] Implement code splitting
- [ ] Add React.memo to components
- [ ] Enable gzip compression
- [ ] Optimize images with next/image

### Phase 2: Database & API
- [ ] Add database indexes
- [ ] Implement connection pooling
- [ ] Enable query caching
- [ ] Batch API requests
- [ ] Implement pagination

### Phase 3: Advanced Optimizations
- [ ] Virtual scrolling for long lists
- [ ] Service worker caching
- [ ] WebAssembly for heavy computations
- [ ] Edge computing with Vercel Edge Functions
- [ ] GraphQL with persisted queries

### Phase 4: Monitoring
- [ ] Set up performance monitoring
- [ ] Create performance dashboard
- [ ] Implement A/B testing
- [ ] Set up alerts for regressions
- [ ] Regular performance audits

## Expected Results
- 60% reduction in initial load time
- 50% reduction in bundle size
- 75% improvement in API response time
- 40% reduction in memory usage
- 90+ Lighthouse performance score
