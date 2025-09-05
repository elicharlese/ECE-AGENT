#!/usr/bin/env tsx
/**
 * Button Migration Script
 * Safely migrates existing button.tsx to new design system
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface MigrationOptions {
  dryRun?: boolean;
  backup?: boolean;
  percentage?: number;
}

class ButtonMigration {
  private readonly projectRoot: string;
  private readonly backupDir: string;

  constructor() {
    this.projectRoot = process.cwd();
    this.backupDir = path.join(this.projectRoot, '.migration-backups');
  }

  /**
   * Step 1: Create backup of current button component
   */
  async createBackup(): Promise<void> {
    console.log('📦 Creating backup of current button component...');
    
    // Ensure backup directory exists
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    const currentButtonPath = path.join(this.projectRoot, 'components/ui/button.tsx');
    const backupPath = path.join(this.backupDir, `button-legacy-${Date.now()}.tsx`);
    const legacyPath = path.join(this.projectRoot, 'components/ui/button-legacy.tsx');

    if (fs.existsSync(currentButtonPath)) {
      // Create timestamped backup
      fs.copyFileSync(currentButtonPath, backupPath);
      
      // Create legacy version for migration wrapper
      fs.copyFileSync(currentButtonPath, legacyPath);
      
      console.log(`✅ Backup created: ${backupPath}`);
      console.log(`✅ Legacy version: ${legacyPath}`);
    } else {
      console.warn('⚠️  No existing button.tsx found');
    }
  }

  /**
   * Step 2: Replace button.tsx with migration wrapper
   */
  async replaceButttonComponent(): Promise<void> {
    console.log('🔄 Replacing button component with migration wrapper...');
    
    const currentButtonPath = path.join(this.projectRoot, 'components/ui/button.tsx');
    const migrationWrapperPath = path.join(this.projectRoot, 'components/ui/button-v2.tsx');
    
    if (fs.existsSync(migrationWrapperPath)) {
      // Replace current button with migration wrapper
      fs.copyFileSync(migrationWrapperPath, currentButtonPath);
      console.log('✅ Button component replaced with migration wrapper');
    } else {
      console.error('❌ Migration wrapper not found at components/ui/button-v2.tsx');
      process.exit(1);
    }
  }

  /**
   * Step 3: Update imports across codebase
   */
  async updateImports(): Promise<void> {
    console.log('🔍 Scanning for button imports...');
    
    try {
      // Find all TypeScript/TSX files that import button
      const result = execSync(
        `find . -name "*.tsx" -o -name "*.ts" | xargs grep -l "from.*components/ui/button" | grep -v node_modules | grep -v .git`,
        { encoding: 'utf-8', cwd: this.projectRoot }
      );
      
      const files = result.trim().split('\n').filter(Boolean);
      console.log(`📄 Found ${files.length} files importing button component`);
      
      // Log files for review (no automatic changes for safety)
      files.forEach(file => {
        console.log(`  - ${file}`);
      });
      
    } catch (error) {
      console.log('ℹ️  No button imports found or search failed');
    }
  }

  /**
   * Step 4: Run tests to ensure compatibility
   */
  async runTests(): Promise<void> {
    console.log('🧪 Running tests to verify migration...');
    
    try {
      execSync('npm run test -- --testPathPattern="button"', {
        stdio: 'inherit',
        cwd: this.projectRoot
      });
      console.log('✅ Button tests passed');
    } catch (error) {
      console.error('❌ Button tests failed');
      throw error;
    }
  }

  /**
   * Step 5: Update environment variables for rollout
   */
  async setupEnvironment(percentage: number = 0): Promise<void> {
    console.log(`🔧 Setting up environment for ${percentage}% rollout...`);
    
    const envPath = path.join(this.projectRoot, '.env.local');
    let envContent = '';
    
    // Read existing .env.local if it exists
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf-8');
    }
    
    // Add or update NEW_BUTTON flag
    const newButtonFlag = `NEXT_PUBLIC_NEW_BUTTON=${percentage > 0 ? 'true' : 'false'}`;
    
    if (envContent.includes('NEXT_PUBLIC_NEW_BUTTON=')) {
      envContent = envContent.replace(/NEXT_PUBLIC_NEW_BUTTON=.*/g, newButtonFlag);
    } else {
      envContent += `\n# UI Migration Flags\n${newButtonFlag}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log(`✅ Environment configured: ${newButtonFlag}`);
  }

  /**
   * Main migration process
   */
  async migrate(options: MigrationOptions = {}): Promise<void> {
    const { dryRun = false, backup = true, percentage = 0 } = options;
    
    console.log('🚀 Starting Button component migration...\n');
    
    if (dryRun) {
      console.log('🔍 DRY RUN MODE - No files will be modified\n');
    }
    
    try {
      // Step 1: Backup
      if (backup && !dryRun) {
        await this.createBackup();
      }
      
      // Step 2: Replace component
      if (!dryRun) {
        await this.replaceButttonComponent();
      }
      
      // Step 3: Scan imports
      await this.updateImports();
      
      // Step 4: Setup environment
      if (!dryRun) {
        await this.setupEnvironment(percentage);
      }
      
      // Step 5: Run tests
      if (!dryRun) {
        await this.runTests();
      }
      
      console.log('\n✅ Button migration completed successfully!');
      console.log('\nNext steps:');
      console.log('1. Review the import scan results above');
      console.log('2. Test the application manually');
      console.log('3. Gradually increase rollout percentage');
      console.log('4. Monitor for any issues');
      
    } catch (error) {
      console.error('\n❌ Migration failed:', error);
      process.exit(1);
    }
  }

  /**
   * Rollback migration
   */
  async rollback(): Promise<void> {
    console.log('⏪ Rolling back Button migration...');
    
    const currentButtonPath = path.join(this.projectRoot, 'components/ui/button.tsx');
    const legacyPath = path.join(this.projectRoot, 'components/ui/button-legacy.tsx');
    
    if (fs.existsSync(legacyPath)) {
      fs.copyFileSync(legacyPath, currentButtonPath);
      console.log('✅ Button component rolled back to legacy version');
      
      // Update environment
      await this.setupEnvironment(0);
      console.log('✅ Environment flags reset');
    } else {
      console.error('❌ No legacy button component found for rollback');
      process.exit(1);
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const migration = new ButtonMigration();
  
  if (args.includes('--rollback')) {
    await migration.rollback();
    return;
  }
  
  const options: MigrationOptions = {
    dryRun: args.includes('--dry-run'),
    backup: !args.includes('--no-backup'),
    percentage: parseInt(args.find(arg => arg.startsWith('--percentage='))?.split('=')[1] || '0'),
  };
  
  await migration.migrate(options);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { ButtonMigration };
