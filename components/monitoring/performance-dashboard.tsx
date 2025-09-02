'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Zap,
  TrendingUp,
  TrendingDown,
  Activity,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  BarChart3
} from 'lucide-react'
import { useWebVitals, formatMetricValue, getRatingColor, WebVitalsMetric } from '@/lib/web-vitals'
import { log } from '@/lib/logger'

interface PerformanceMetrics {
  metrics: WebVitalsMetric[]
  isTracking: boolean
  lastUpdated: Date | null
}

export function PerformanceDashboard() {
  const { metrics, isTracking } = useWebVitals()
  const [performanceData, setPerformanceData] = useState<PerformanceMetrics>({
    metrics: [],
    isTracking: false,
    lastUpdated: null
  })

  useEffect(() => {
    if (metrics.length > 0) {
      setPerformanceData({
        metrics,
        isTracking,
        lastUpdated: new Date()
      })
    }
  }, [metrics, isTracking])

  const getMetricDescription = (name: string): string => {
    const descriptions = {
      CLS: 'Cumulative Layout Shift - Measures visual stability',
      FID: 'First Input Delay - Measures interactivity',
      FCP: 'First Contentful Paint - Measures loading performance',
      LCP: 'Largest Contentful Paint - Measures loading performance',
      TTFB: 'Time to First Byte - Measures server response time'
    }
    return descriptions[name as keyof typeof descriptions] || ''
  }

  const getMetricIcon = (name: string) => {
    const icons = {
      CLS: <Activity className="h-5 w-5" />,
      FID: <Zap className="h-5 w-5" />,
      FCP: <Clock className="h-5 w-5" />,
      LCP: <Target className="h-5 w-5" />,
      TTFB: <BarChart3 className="h-5 w-5" />
    }
    return icons[name as keyof typeof icons] || <Activity className="h-5 w-5" />
  }

  const getOverallScore = (): { score: number; rating: 'good' | 'needs-improvement' | 'poor' } => {
    if (performanceData.metrics.length === 0) return { score: 0, rating: 'poor' }

    const ratings = performanceData.metrics.map(m => m.rating)
    const goodCount = ratings.filter(r => r === 'good').length
    const score = (goodCount / ratings.length) * 100

    let overallRating: 'good' | 'needs-improvement' | 'poor' = 'poor'
    if (score >= 80) overallRating = 'good'
    else if (score >= 60) overallRating = 'needs-improvement'

    return { score: Math.round(score), rating: overallRating }
  }

  const overallScore = getOverallScore()

  if (!isTracking && performanceData.metrics.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Performance Monitoring
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Collecting Core Web Vitals metrics...
            </p>
            <div className="animate-pulse flex space-x-4 justify-center">
              <div className="rounded-full bg-gray-300 h-3 w-3"></div>
              <div className="rounded-full bg-gray-300 h-3 w-3"></div>
              <div className="rounded-full bg-gray-300 h-3 w-3"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Performance Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Core Web Vitals and performance metrics
          </p>
        </div>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          size="sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Page
        </Button>
      </div>

      {/* Overall Performance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Overall Performance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-3xl font-bold">{overallScore.score}%</span>
                <Badge className={getRatingColor(overallScore.rating)}>
                  {overallScore.rating === 'good' && <CheckCircle className="h-4 w-4 mr-1" />}
                  {overallScore.rating === 'needs-improvement' && <AlertTriangle className="h-4 w-4 mr-1" />}
                  {overallScore.rating === 'poor' && <TrendingDown className="h-4 w-4 mr-1" />}
                  {overallScore.rating.replace('-', ' ').toUpperCase()}
                </Badge>
              </div>
              <Progress value={overallScore.score} className="h-3" />
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                Based on {performanceData.metrics.length} Core Web Vitals metrics
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Core Web Vitals Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {performanceData.metrics.map((metric) => (
              <Card key={metric.name}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    {getMetricIcon(metric.name)}
                    {metric.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">
                        {formatMetricValue(metric.name, metric.value)}
                      </span>
                      <Badge className={getRatingColor(metric.rating)} variant="secondary">
                        {metric.rating}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {getMetricDescription(metric.name)}
                    </p>

                    {metric.navigationType && (
                      <p className="text-xs text-gray-500">
                        Navigation: {metric.navigationType}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {performanceData.metrics.length === 0 && (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    No Metrics Yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Core Web Vitals metrics will appear here as they are collected.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceData.metrics.map((metric) => (
                  <div key={metric.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getMetricIcon(metric.name)}
                      <div>
                        <p className="font-medium">{metric.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {getMetricDescription(metric.name)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {formatMetricValue(metric.name, metric.value)}
                      </p>
                      <Badge className={getRatingColor(metric.rating)} variant="outline">
                        {metric.rating}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {performanceData.metrics.some(m => m.rating === 'poor') && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-800 dark:text-red-200">
                        Critical Performance Issues
                      </h4>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                        Some metrics are performing poorly. Consider optimizing:
                      </p>
                      <ul className="text-sm text-red-700 dark:text-red-300 mt-2 space-y-1">
                        {performanceData.metrics
                          .filter(m => m.rating === 'poor')
                          .map(m => (
                            <li key={m.name}>• {m.name}: {formatMetricValue(m.name, m.value)}</li>
                          ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {performanceData.metrics.some(m => m.rating === 'needs-improvement') && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                        Performance Improvements Needed
                      </h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                        Consider optimizing these metrics:
                      </p>
                      <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 space-y-1">
                        {performanceData.metrics
                          .filter(m => m.rating === 'needs-improvement')
                          .map(m => (
                            <li key={m.name}>• {m.name}: {formatMetricValue(m.name, m.value)}</li>
                          ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {performanceData.metrics.every(m => m.rating === 'good') && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-800 dark:text-green-200">
                        Excellent Performance!
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        All Core Web Vitals are performing well. Keep up the great work!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="font-medium">General Recommendations</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <li>• Optimize images and use modern formats (WebP, AVIF)</li>
                  <li>• Minimize render-blocking resources</li>
                  <li>• Use code splitting and lazy loading</li>
                  <li>• Implement proper caching strategies</li>
                  <li>• Minimize unused JavaScript and CSS</li>
                  <li>• Use a Content Delivery Network (CDN)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
