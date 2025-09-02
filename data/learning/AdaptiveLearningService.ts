import { z } from 'zod';
import { promises as fs } from 'fs';
import { join } from 'path';
import {
  AdaptiveStrategy,
  ConsequenceRecord,
  AdaptiveStrategySchema,
} from '../../src/types/agent-observability';

export interface LearningStorage {
  saveStrategy(strategy: AdaptiveStrategy): Promise<void>;
  loadStrategies(category?: string): Promise<AdaptiveStrategy[]>;
  updateStrategy(id: string, updates: Partial<AdaptiveStrategy>): Promise<void>;
  deleteStrategy(id: string): Promise<void>;
}

export class FileSystemLearningStorage implements LearningStorage {
  private basePath: string;

  constructor(basePath: string = 'data/learning') {
    this.basePath = basePath;
  }

  async saveStrategy(strategy: AdaptiveStrategy): Promise<void> {
    await fs.mkdir(this.basePath, { recursive: true });
    
    const filePath = join(this.basePath, `${strategy.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(strategy, null, 2), 'utf8');
  }

  async loadStrategies(category?: string): Promise<AdaptiveStrategy[]> {
    try {
      const files = await fs.readdir(this.basePath);
      const strategies: AdaptiveStrategy[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = join(this.basePath, file);
          const content = await fs.readFile(filePath, 'utf8');
          const strategy = AdaptiveStrategySchema.parse(JSON.parse(content));
          
          if (!category || strategy.category === category) {
            strategies.push(strategy);
          }
        }
      }

      return strategies.sort((a, b) => b.confidence - a.confidence);
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  async updateStrategy(id: string, updates: Partial<AdaptiveStrategy>): Promise<void> {
    const strategies = await this.loadStrategies();
    const strategy = strategies.find(s => s.id === id);
    
    if (!strategy) {
      throw new Error(`Strategy ${id} not found`);
    }

    const updatedStrategy = { ...strategy, ...updates };
    await this.saveStrategy(updatedStrategy);
  }

  async deleteStrategy(id: string): Promise<void> {
    const filePath = join(this.basePath, `${id}.json`);
    await fs.unlink(filePath);
  }
}

export class AdaptiveLearningService {
  private storage: LearningStorage;

  constructor(storage?: LearningStorage) {
    this.storage = storage || new FileSystemLearningStorage();
  }

  async recordStrategy(strategy: AdaptiveStrategy): Promise<void> {
    return this.storage.saveStrategy(strategy);
  }

  async getStrategies(category?: string): Promise<AdaptiveStrategy[]> {
    return this.storage.loadStrategies(category);
  }

  async learnFromConsequences(record: ConsequenceRecord): Promise<AdaptiveStrategy[]> {
    const newStrategies: AdaptiveStrategy[] = [];

    // Learn from guardrail patterns
    const guardrailStrategies = await this.analyzeGuardrailPatterns(record);
    newStrategies.push(...guardrailStrategies);

    // Learn from file modification patterns
    const fileStrategies = await this.analyzeFilePatterns(record);
    newStrategies.push(...fileStrategies);

    // Learn from tool usage patterns
    const toolStrategies = await this.analyzeToolPatterns(record);
    newStrategies.push(...toolStrategies);

    // Learn from error recovery patterns
    const errorStrategies = await this.analyzeErrorPatterns(record);
    newStrategies.push(...errorStrategies);

    // Save all new strategies
    for (const strategy of newStrategies) {
      await this.storage.saveStrategy(strategy);
    }

    return newStrategies;
  }

  async getRelevantStrategies(context: {
    fileTypes?: string[];
    toolsUsed?: string[];
    errorContext?: string;
    category?: string;
  }): Promise<AdaptiveStrategy[]> {
    const allStrategies = await this.storage.loadStrategies(context.category);
    
    // Filter and rank strategies by relevance
    return allStrategies
      .filter(strategy => this.isStrategyRelevant(strategy, context))
      .sort((a, b) => {
        // Sort by confidence * success rate * recency
        const scoreA = a.confidence * a.successRate * this.getRecencyScore(a.lastUsed);
        const scoreB = b.confidence * b.successRate * this.getRecencyScore(b.lastUsed);
        return scoreB - scoreA;
      })
      .slice(0, 10); // Top 10 most relevant strategies
  }

  async recordStrategyUsage(strategyId: string, success: boolean): Promise<void> {
    const strategies = await this.storage.loadStrategies();
    const strategy = strategies.find(s => s.id === strategyId);
    
    if (!strategy) {
      return;
    }

    // Update usage statistics
    const totalUsages = strategy.usageCount + 1;
    const successfulUsages = success 
      ? Math.round(strategy.successRate * strategy.usageCount) + 1
      : Math.round(strategy.successRate * strategy.usageCount);
    
    const updates: Partial<AdaptiveStrategy> = {
      usageCount: totalUsages,
      successRate: successfulUsages / totalUsages,
      lastUsed: new Date().toISOString(),
      confidence: Math.min(1, strategy.confidence + (success ? 0.1 : -0.05)),
    };

    await this.storage.updateStrategy(strategyId, updates);
  }

  async generateOptimizationSuggestions(record: ConsequenceRecord): Promise<string[]> {
    const suggestions: string[] = [];

    // Analyze performance patterns
    const slowGuardrails = record.guardrails.filter(g => g.duration > 30000); // > 30s
    if (slowGuardrails.length > 0) {
      suggestions.push(`Consider optimizing slow guardrails: ${slowGuardrails.map(g => g.name).join(', ')}`);
    }

    // Analyze failure patterns
    const failedGuardrails = record.guardrails.filter(g => g.status === 'fail');
    if (failedGuardrails.length > 0) {
      suggestions.push(`Address recurring failures in: ${failedGuardrails.map(g => g.name).join(', ')}`);
    }

    // Analyze file modification patterns
    const fileTypes = record.transformation.filesTouched.map(f => f.split('.').pop()).filter(Boolean);
    const typeFrequency = fileTypes.reduce((acc, type) => {
      if (type) {
        acc[type] = (acc[type] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const dominantType = Object.entries(typeFrequency).sort(([,a], [,b]) => b - a)[0];
    if (dominantType && dominantType[1] > 3) {
      suggestions.push(`Consider creating specialized templates for ${dominantType[0]} files`);
    }

    // Analyze tool usage efficiency
    const toolUsage = record.toolCalls.reduce((acc, call) => {
      acc[call.name] = (acc[call.name] || 0) + call.duration;
      return acc;
    }, {} as Record<string, number>);

    const slowTools = Object.entries(toolUsage)
      .filter(([, duration]) => duration > 5000)
      .map(([name]) => name);

    if (slowTools.length > 0) {
      suggestions.push(`Optimize tool usage for: ${slowTools.join(', ')}`);
    }

    return suggestions;
  }

  private async analyzeGuardrailPatterns(record: ConsequenceRecord): Promise<AdaptiveStrategy[]> {
    const strategies: AdaptiveStrategy[] = [];

    // Pattern: Files that consistently pass/fail certain guardrails
    const fileGuardrailMap = new Map<string, { passed: string[], failed: string[] }>();
    
    for (const file of record.transformation.filesTouched) {
      const fileExt = file.split('.').pop() || '';
      const passed = record.guardrails.filter(g => g.status === 'pass').map(g => g.name);
      const failed = record.guardrails.filter(g => g.status === 'fail').map(g => g.name);
      
      fileGuardrailMap.set(fileExt, { passed, failed });
    }

    // Create strategies for file type + guardrail combinations
    for (const [fileType, results] of fileGuardrailMap) {
      if (results.failed.length > 0) {
        strategies.push({
          id: `guardrail-${fileType}-${Date.now()}`,
          name: `${fileType} files tend to fail ${results.failed.join(', ')}`,
          category: 'optimization',
          pattern: `Files with extension .${fileType} commonly fail guardrails: ${results.failed.join(', ')}`,
          confidence: 0.7,
          usageCount: 1,
          successRate: 0.5,
          lastUsed: new Date().toISOString(),
          metadata: { fileType, failedGuardrails: results.failed },
        });
      }
    }

    return strategies;
  }

  private async analyzeFilePatterns(record: ConsequenceRecord): Promise<AdaptiveStrategy[]> {
    const strategies: AdaptiveStrategy[] = [];

    // Pattern: Files frequently modified together
    if (record.transformation.filesTouched.length > 1) {
      const fileGroups = this.groupRelatedFiles(record.transformation.filesTouched);
      
      for (const group of fileGroups) {
        if (group.length > 1) {
          strategies.push({
            id: `file-group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: `Files often modified together: ${group.join(', ')}`,
            category: 'code_generation',
            pattern: `When modifying ${group[0]}, also consider updating: ${group.slice(1).join(', ')}`,
            confidence: 0.6,
            usageCount: 1,
            successRate: 0.8,
            lastUsed: new Date().toISOString(),
            metadata: { relatedFiles: group },
          });
        }
      }
    }

    return strategies;
  }

  private async analyzeToolPatterns(record: ConsequenceRecord): Promise<AdaptiveStrategy[]> {
    const strategies: AdaptiveStrategy[] = [];

    // Pattern: Tool usage sequences
    const toolSequence = record.toolCalls.map(t => t.name);
    if (toolSequence.length > 1) {
      strategies.push({
        id: `tool-sequence-${Date.now()}`,
        name: `Common tool sequence: ${toolSequence.join(' → ')}`,
        category: 'optimization',
        pattern: `Tool usage pattern: ${toolSequence.join(' followed by ')}`,
        confidence: 0.5,
        usageCount: 1,
        successRate: record.decision === 'proceed' ? 0.9 : 0.3,
        lastUsed: new Date().toISOString(),
        metadata: { toolSequence },
      });
    }

    return strategies;
  }

  private async analyzeErrorPatterns(record: ConsequenceRecord): Promise<AdaptiveStrategy[]> {
    const strategies: AdaptiveStrategy[] = [];

    // Pattern: Error recovery strategies
    const errors = record.events.filter(e => e.severity === 'error' || e.severity === 'critical');
    const failedGuardrails = record.guardrails.filter(g => g.status === 'fail');

    if (errors.length > 0 && record.decision === 'proceed') {
      // This transformation recovered from errors successfully
      strategies.push({
        id: `error-recovery-${Date.now()}`,
        name: `Successful recovery from ${errors.length} errors`,
        category: 'error_recovery',
        pattern: `Recovery strategy for errors: ${errors.map(e => e.name).join(', ')}`,
        confidence: 0.8,
        usageCount: 1,
        successRate: 0.9,
        lastUsed: new Date().toISOString(),
        metadata: { 
          errorTypes: errors.map(e => e.name),
          recoveryActions: record.toolCalls.map(t => t.name),
        },
      });
    }

    return strategies;
  }

  private groupRelatedFiles(files: string[]): string[][] {
    const groups: string[][] = [];
    
    // Group by directory
    const dirGroups = files.reduce((acc, file) => {
      const dir = file.split('/').slice(0, -1).join('/');
      if (!acc[dir]) acc[dir] = [];
      acc[dir].push(file);
      return acc;
    }, {} as Record<string, string[]>);

    // Group by file type
    const typeGroups = files.reduce((acc, file) => {
      const ext = file.split('.').pop() || '';
      if (!acc[ext]) acc[ext] = [];
      acc[ext].push(file);
      return acc;
    }, {} as Record<string, string[]>);

    // Add groups with more than one file
    Object.values(dirGroups).forEach(group => {
      if (group.length > 1) groups.push(group);
    });

    Object.values(typeGroups).forEach(group => {
      if (group.length > 1) groups.push(group);
    });

    return groups;
  }

  private isStrategyRelevant(strategy: AdaptiveStrategy, context: {
    fileTypes?: string[];
    toolsUsed?: string[];
    errorContext?: string;
    category?: string;
  }): boolean {
    // Check category match
    if (context.category && strategy.category !== context.category) {
      return false;
    }

    // Check file type relevance
    if (context.fileTypes && strategy.metadata?.fileType) {
      if (!context.fileTypes.includes(strategy.metadata.fileType as string)) {
        return false;
      }
    }

    // Check tool relevance
    if (context.toolsUsed && strategy.metadata?.toolSequence) {
      const toolSequence = strategy.metadata.toolSequence as string[];
      const hasCommonTools = context.toolsUsed.some(tool => 
        toolSequence.includes(tool)
      );
      if (!hasCommonTools) {
        return false;
      }
    }

    // Check error context relevance
    if (context.errorContext && strategy.metadata?.errorTypes) {
      const errorTypes = strategy.metadata.errorTypes as string[];
      const hasRelevantError = errorTypes.some((errorType: string) =>
        context.errorContext?.includes(errorType)
      );
      if (!hasRelevantError) {
        return false;
      }
    }

    return true;
  }

  private getRecencyScore(lastUsed: string): number {
    const daysSinceUsed = (Date.now() - new Date(lastUsed).getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0.1, 1 - (daysSinceUsed / 30)); // Decay over 30 days
  }
}
