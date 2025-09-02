import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AdaptiveLearningService, FileSystemLearningStorage } from '../../../../data/learning/AdaptiveLearningService';
import { AdaptiveStrategySchema } from '../../../../src/types/agent-observability';

const learningService = new AdaptiveLearningService(
  new FileSystemLearningStorage('data/learning')
);

// GET /api/observability/learning - Get adaptive strategies
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const fileTypes = searchParams.get('fileTypes')?.split(',');
    const toolsUsed = searchParams.get('toolsUsed')?.split(',');
    const errorContext = searchParams.get('errorContext') || undefined;

    const strategies = await learningService.getRelevantStrategies({
      category,
      fileTypes,
      toolsUsed,
      errorContext,
    });

    return NextResponse.json({
      strategies,
      total: strategies.length,
    });

  } catch (error) {
    console.error('Learning API error:', error);
    return NextResponse.json({ error: 'Failed to fetch learning strategies' }, { status: 500 });
  }
}

// POST /api/observability/learning - Record strategy usage
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { strategyId, success } = z.object({
      strategyId: z.string(),
      success: z.boolean(),
    }).parse(body);

    await learningService.recordStrategyUsage(strategyId, success);

    return NextResponse.json({ success: true });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: error.errors 
      }, { status: 400 });
    }

    console.error('Learning API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
