"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  FileText, 
  Search, 
  Pin, 
  Download, 
  Share2, 
  MoreHorizontal,
  Eye,
  Edit3,
  Clock
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { UI_CONSTANTS } from "@/lib/ui-constants"

interface Document {
  id: string
  title: string
  type: 'pdf' | 'doc' | 'sheet' | 'presentation' | 'text'
  size: string
  lastModified: Date
  author: {
    name: string
    avatar?: string
  }
  isPinned: boolean
  isShared: boolean
  tags: string[]
  preview?: string
}

export function DocsSection() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<'all' | 'pinned' | 'recent'>('all')

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const mockDocs: Document[] = [
          {
            id: "1",
            title: "Project Requirements Document",
            type: "doc",
            size: "2.4 MB",
            lastModified: new Date(Date.now() - 1000 * 60 * 30),
            author: {
              name: "Sarah Chen",
              avatar: "/placeholder-user.jpg"
            },
            isPinned: true,
            isShared: true,
            tags: ["project", "requirements"],
            preview: "This document outlines the core requirements for the new user dashboard..."
          },
          {
            id: "2",
            title: "Q4 Financial Report",
            type: "sheet",
            size: "1.8 MB",
            lastModified: new Date(Date.now() - 1000 * 60 * 60 * 2),
            author: {
              name: "Mike Johnson"
            },
            isPinned: true,
            isShared: false,
            tags: ["finance", "quarterly"],
            preview: "Financial performance analysis for Q4 including revenue, expenses..."
          },
          {
            id: "3",
            title: "Design System Guidelines",
            type: "pdf",
            size: "5.2 MB",
            lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24),
            author: {
              name: "Alex Rivera"
            },
            isPinned: false,
            isShared: true,
            tags: ["design", "guidelines"],
            preview: "Comprehensive guide to our design system including colors, typography..."
          },
          {
            id: "4",
            title: "Team Meeting Notes",
            type: "text",
            size: "0.3 MB",
            lastModified: new Date(Date.now() - 1000 * 60 * 60 * 48),
            author: {
              name: "Emma Davis"
            },
            isPinned: false,
            isShared: true,
            tags: ["meeting", "notes"],
            preview: "Weekly team meeting notes covering project updates, blockers..."
          }
        ]
        
        setDocuments(mockDocs)
      } catch (error) {
        console.error('Failed to fetch documents:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [])

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'pinned' && doc.isPinned) ||
                         (filter === 'recent' && Date.now() - doc.lastModified.getTime() < 1000 * 60 * 60 * 24)
    
    return matchesSearch && matchesFilter
  })

  const handleTogglePin = (docId: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === docId ? { ...doc, isPinned: !doc.isPinned } : doc
    ))
  }

  const getFileIcon = (type: Document['type']) => {
    switch (type) {
      case 'pdf': return '📄'
      case 'doc': return '📝'
      case 'sheet': return '📊'
      case 'presentation': return '📋'
      default: return '📄'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                <div className="h-10 w-10 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  const pinnedDocs = filteredDocuments.filter(doc => doc.isPinned)
  const recentDocs = filteredDocuments.filter(doc => !doc.isPinned)

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant={filter === 'pinned' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('pinned')}
              >
                Pinned
              </Button>
              <Button
                variant={filter === 'recent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('recent')}
              >
                Recent
              </Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
      </Card>

      {/* Pinned Documents */}
      {pinnedDocs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Pin className="h-4 w-4" />
              Pinned Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pinnedDocs.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onTogglePin={handleTogglePin}
                getFileIcon={getFileIcon}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-4 w-4" />
            Recent Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentDocs.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No documents found
            </div>
          ) : (
            recentDocs.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onTogglePin={handleTogglePin}
                getFileIcon={getFileIcon}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function DocumentCard({ 
  document, 
  onTogglePin, 
  getFileIcon 
}: { 
  document: Document
  onTogglePin: (id: string) => void
  getFileIcon: (type: Document['type']) => string
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <div className="h-10 w-10 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg">
        {getFileIcon(document.type)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
            {document.title}
          </h4>
          {document.isPinned && (
            <Pin className="h-3 w-3 text-blue-500" fill="currentColor" />
          )}
          {document.isShared && (
            <Share2 className="h-3 w-3 text-green-500" />
          )}
        </div>
        
        <div className={`flex items-center ${UI_CONSTANTS.spacing.sm} ${UI_CONSTANTS.text.xs} text-gray-500 dark:text-gray-400 mb-2`}>
          <span>By {document.author.name}</span>
          <span>•</span>
          <span>{document.size}</span>
          <span>•</span>
          <span>{formatDistanceToNow(document.lastModified, { addSuffix: true })}</span>
        </div>
        
        {document.preview && (
          <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
            {document.preview}
          </p>
        )}
        
        <div className={`flex items-start ${UI_CONSTANTS.spacing.lg}`}>
          {document.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onTogglePin(document.id)}
          className={document.isPinned ? 'text-blue-500' : 'text-gray-400'}
        >
          <Pin className="h-4 w-4" fill={document.isPinned ? 'currentColor' : 'none'} />
        </Button>
        
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
          <Eye className="h-4 w-4" />
        </Button>
        
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
          <Download className="h-4 w-4" />
        </Button>
        
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
