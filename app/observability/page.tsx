import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Separator } from '../../components/ui/separator';
import { 
  Activity, 
  Shield, 
  Brain, 
  GitBranch, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  Zap,
  Database,
  TrendingUp
} from 'lucide-react';

interface Transformation {
  id: string;
  patchId: number;
  branch: string;
  timestamp: string;
  coreProtectionStatus: 'safe' | 'violation_detected' | 'violation_blocked';
  decision: 'proceed' | 'fix_required' | 'rollback' | 'manual_review';
  coreIntegrityVerified: boolean;
  filesTouched: string[];
  guardrails: Array<{
    name: string;
    status: 'pass' | 'fail' | 'warn' | 'skip' | 'error';
    duration: number;
    metrics: Record<string, any>;
  }>;
  summary: string;
}

interface AdaptiveStrategy {
  id: string;
  name: string;
  category: string;
  confidence: number;
  successRate: number;
  usageCount: number;
  lastUsed: string;
  pattern: string;
}

// Mock data for demonstration
const mockTransformations: Transformation[] = [
  {
    id: 'patch-18@c1a2b3',
    patchId: 18,
    branch: 'windsprint/batch-3',
    timestamp: '2025-09-01T17:00:00Z',
    coreProtectionStatus: 'safe',
    decision: 'proceed',
    coreIntegrityVerified: true,
    filesTouched: ['data/learning/AdaptiveLearningService.ts', 'docs/patches/patch-18/PATCH18_SUMMARY.md'],
    guardrails: [
      { name: 'typecheck', status: 'pass', duration: 2500, metrics: { errors: 0 } },
      { name: 'lint', status: 'pass', duration: 1200, metrics: { errors: 0, warnings: 2 } },
      { name: 'test', status: 'pass', duration: 8500, metrics: { passed: 72, failed: 0, coverage: 94.2 } },
      { name: 'build', status: 'pass', duration: 15000, metrics: { success: true } },
      { name: 'core_protection', status: 'pass', duration: 500, metrics: { violations: 0 } },
    ],
    summary: 'Implemented AGENT self-observation architecture with pristine core protection',
  },
  {
    id: 'patch-17@d4e5f6',
    patchId: 17,
    branch: 'windsprint/batch-3',
    timestamp: '2025-09-01T15:30:00Z',
    coreProtectionStatus: 'safe',
    decision: 'proceed',
    coreIntegrityVerified: true,
    filesTouched: ['components/chat/chat-window.tsx', 'lib/utils.ts'],
    guardrails: [
      { name: 'typecheck', status: 'pass', duration: 2100, metrics: { errors: 0 } },
      { name: 'lint', status: 'warn', duration: 1100, metrics: { errors: 0, warnings: 5 } },
      { name: 'test', status: 'pass', duration: 7200, metrics: { passed: 68, failed: 0, coverage: 91.8 } },
      { name: 'build', status: 'pass', duration: 12000, metrics: { success: true } },
      { name: 'core_protection', status: 'pass', duration: 400, metrics: { violations: 0 } },
    ],
    summary: 'Enhanced chat UI with improved message handling',
  },
];

const mockStrategies: AdaptiveStrategy[] = [
  {
    id: 'strategy-1',
    name: 'TypeScript files often require lint fixes',
    category: 'optimization',
    confidence: 0.85,
    successRate: 0.92,
    usageCount: 15,
    lastUsed: '2025-09-01T16:45:00Z',
    pattern: 'Files with .ts/.tsx extensions commonly trigger lint warnings for unused imports',
  },
  {
    id: 'strategy-2',
    name: 'Chat components frequently modified together',
    category: 'code_generation',
    confidence: 0.78,
    successRate: 0.88,
    usageCount: 8,
    lastUsed: '2025-09-01T15:20:00Z',
    pattern: 'When modifying chat-window.tsx, also consider updating message-input.tsx and chat-sidebar.tsx',
  },
];

function StatusBadge({ status }: { status: string }) {
  const variants = {
    pass: 'bg-green-100 text-green-800 border-green-200',
    fail: 'bg-red-100 text-red-800 border-red-200',
    warn: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    safe: 'bg-green-100 text-green-800 border-green-200',
    proceed: 'bg-blue-100 text-blue-800 border-blue-200',
  };

  const icons = {
    pass: CheckCircle,
    fail: XCircle,
    warn: AlertTriangle,
    safe: Shield,
    proceed: CheckCircle,
  };

  const Icon = icons[status as keyof typeof icons] || Activity;
  const className = variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800 border-gray-200';

  return (
    <Badge className={`${className} flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  );
}

function TransformationCard({ transformation }: { transformation: Transformation }) {
  const passedGuardrails = transformation.guardrails.filter(g => g.status === 'pass').length;
  const totalGuardrails = transformation.guardrails.length;

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Patch {transformation.patchId}
          </CardTitle>
          <div className="flex gap-2">
            <StatusBadge status={transformation.coreProtectionStatus} />
            <StatusBadge status={transformation.decision} />
          </div>
        </div>
        <CardDescription className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(transformation.timestamp).toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Core: {transformation.coreIntegrityVerified ? '✅ Verified' : '❌ Compromised'}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-3">{transformation.summary}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="font-medium text-sm mb-2">Files Modified ({transformation.filesTouched.length})</h4>
            <ScrollArea className="h-20">
              {transformation.filesTouched.map((file, idx) => (
                <div key={idx} className="text-xs text-gray-600 mb-1">
                  {file}
                </div>
              ))}
            </ScrollArea>
          </div>
          
          <div>
            <h4 className="font-medium text-sm mb-2">
              Guardrails ({passedGuardrails}/{totalGuardrails} passed)
            </h4>
            <div className="space-y-1">
              {transformation.guardrails.map((guardrail, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <StatusBadge status={guardrail.status} />
                    {guardrail.name}
                  </span>
                  <span className="text-gray-500">
                    {guardrail.duration}ms
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StrategyCard({ strategy }: { strategy: AdaptiveStrategy }) {
  return (
    <Card className="mb-3">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{strategy.name}</CardTitle>
          <Badge variant="outline" className="text-xs">
            {strategy.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-gray-600 mb-3">{strategy.pattern}</p>
        
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="font-medium">{Math.round(strategy.confidence * 100)}%</div>
            <div className="text-gray-500">Confidence</div>
          </div>
          <div className="text-center">
            <div className="font-medium">{Math.round(strategy.successRate * 100)}%</div>
            <div className="text-gray-500">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="font-medium">{strategy.usageCount}</div>
            <div className="text-gray-500">Usage Count</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ObservabilityDashboard() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Eye className="h-8 w-8 text-blue-600" />
          AGENT Observability Dashboard
        </h1>
        <p className="text-gray-600">
          Monitor transformation history, core protection status, and adaptive learning insights
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              Total Transformations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-gray-600">+2 this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              Core Protection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">100%</div>
            <p className="text-xs text-gray-600">0 violations detected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-600" />
              Learning Strategies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-gray-600">avg 89% success rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              Test Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-gray-600">above 90% target</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transformations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transformations" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Transformations
          </TabsTrigger>
          <TabsTrigger value="learning" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Learning Insights
          </TabsTrigger>
          <TabsTrigger value="protection" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Core Protection
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transformations" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Transformations</h2>
            <Button variant="outline" size="sm">
              <Database className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
          
          <Suspense fallback={<div>Loading transformations...</div>}>
            <div className="space-y-4">
              {mockTransformations.map((transformation) => (
                <TransformationCard key={transformation.id} transformation={transformation} />
              ))}
            </div>
          </Suspense>
        </TabsContent>

        <TabsContent value="learning" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Adaptive Learning Strategies</h2>
            <Button variant="outline" size="sm">
              <Brain className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockStrategies.map((strategy) => (
              <StrategyCard key={strategy.id} strategy={strategy} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="protection" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Pristine Core Protection Status</h2>
            <Button variant="outline" size="sm">
              <Shield className="h-4 w-4 mr-2" />
              Run Audit
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Core Integrity Report
              </CardTitle>
              <CardDescription>
                Last audit: {new Date().toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Pristine Core Status</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    PROTECTED
                  </Badge>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">Protected Files</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• src/types/agent.ts</li>
                      <li>• src/types/conversation.ts</li>
                      <li>• prisma/schema.prisma</li>
                      <li>• middleware.ts</li>
                      <li>• components/ui/**</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Learning Layer</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• docs/patches/**</li>
                      <li>• data/learning/**</li>
                      <li>• Adaptive strategies: 47 active</li>
                      <li>• Transformation records: 24 total</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
