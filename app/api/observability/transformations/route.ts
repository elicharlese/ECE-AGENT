import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import {
  ConsequenceRecord,
  ConsequenceRecordSchema,
  TransformationRowSchema,
  GuardrailRowSchema,
  ArtifactRowSchema,
} from '../../../../src/types/agent-observability';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/observability/transformations - List transformations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const patchId = searchParams.get('patchId');
    const branch = searchParams.get('branch');
    const authorId = searchParams.get('authorId');

    let query = supabase
      .from('transformations')
      .select(`
        *,
        guardrails(*),
        artifacts(*)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (patchId) {
      query = query.eq('patch_id', parseInt(patchId));
    }
    if (branch) {
      query = query.eq('branch', branch);
    }
    if (authorId) {
      query = query.eq('author_id', authorId);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch transformations' }, { status: 500 });
    }

    return NextResponse.json({
      transformations: data || [],
      total: count || 0,
      limit,
      offset,
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/observability/transformations - Create transformation record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const record = ConsequenceRecordSchema.parse(body);

    // Transform to database schema
    const transformationRow = {
      id: record.transformation.id,
      patch_id: record.transformation.patchId,
      batch_id: record.transformation.batchId || null,
      branch: record.transformation.branch,
      author_id: record.transformation.authorId,
      created_at: record.transformation.timestamp,
      categories: record.transformation.categories,
      files_touched: record.transformation.filesTouched,
      git_stats: record.transformation.gitStats,
      core_protection_status: record.transformation.coreProtectionStatus,
      summary: record.summary,
      decision: record.decision,
      core_integrity_verified: record.coreIntegrityVerified,
    };

    // Insert transformation
    const { error: transformationError } = await supabase
      .from('transformations')
      .insert(transformationRow);

    if (transformationError) {
      console.error('Transformation insert error:', transformationError);
      return NextResponse.json({ error: 'Failed to create transformation' }, { status: 500 });
    }

    // Insert guardrails
    if (record.guardrails.length > 0) {
      const guardrailRows = record.guardrails.map(g => ({
        id: `${record.transformation.id}-${g.name}`,
        transformation_id: record.transformation.id,
        name: g.name,
        status: g.status,
        created_at: g.timestamp,
        duration: g.duration,
        metrics: g.metrics,
        exit_code: g.exitCode || null,
      }));

      const { error: guardrailError } = await supabase
        .from('guardrails')
        .insert(guardrailRows);

      if (guardrailError) {
        console.error('Guardrail insert error:', guardrailError);
        // Don't fail the whole request for guardrail errors
      }
    }

    // Insert artifacts
    if (record.artifacts.length > 0) {
      const artifactRows = record.artifacts.map(a => ({
        id: a.id,
        transformation_id: record.transformation.id,
        kind: a.kind,
        path: a.path,
        hash: a.hash || null,
        size: a.size || null,
        metadata: a.metadata || null,
        created_at: new Date().toISOString(),
      }));

      const { error: artifactError } = await supabase
        .from('artifacts')
        .insert(artifactRows);

      if (artifactError) {
        console.error('Artifact insert error:', artifactError);
        // Don't fail the whole request for artifact errors
      }
    }

    return NextResponse.json({ 
      success: true, 
      transformationId: record.transformation.id 
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: error.errors 
      }, { status: 400 });
    }

    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
