#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

const COMPONENT_MAPPINGS = {
  'Progress': '@/libs/design-system',
  'Tabs': '@/libs/design-system',
  'Label': '@/libs/design-system',
  'Switch': '@/libs/design-system',
  'Textarea': '@/libs/design-system',
  'Select': '@/libs/design-system',
  'Separator': '@/libs/design-system',
  'Drawer': '@/libs/design-system',
  'ScrollArea': '@/libs/design-system',
  'DropdownMenu': '@/libs/design-system',
  'Toast': '@/libs/design-system',
  'Tooltip': '@/libs/design-system',
  'Sheet': '@/libs/design-system',
};

async function updateImports() {
  console.log('🔍 Finding TypeScript and TSX files...');
  
  const files = await glob('**/*.{ts,tsx}', {
    ignore: [
      'node_modules/**',
      '.next/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '.nx/**',
      'libs/design-system/**', // Don't modify design system files
    ],
    cwd: process.cwd(),
  });

  console.log(`📝 Found ${files.length} files to process`);

  let totalUpdated = 0;

  for (const file of files) {
    const filePath = path.resolve(file);
    const content = fs.readFileSync(filePath, 'utf-8');
    let updatedContent = content;
    let fileUpdated = false;

    // Check if file uses any of our components
    const usedComponents = Object.keys(COMPONENT_MAPPINGS).filter(component =>
      content.includes(`<${component}`) || 
      content.includes(`${component}.`) ||
      content.includes(`{${component}}`) ||
      content.includes(`${component},`)
    );

    if (usedComponents.length === 0) {
      continue;
    }

    console.log(`🔧 Processing: ${file}`);
    console.log(`   Components found: ${usedComponents.join(', ')}`);

    // Check if design system import already exists
    const hasDesignSystemImport = content.includes("from '@/libs/design-system'");
    
    if (!hasDesignSystemImport) {
      // Find existing imports to determine where to add new import
      const importLines = content.split('\n').filter(line => 
        line.trim().startsWith('import') && 
        line.includes('from') &&
        !line.includes('type')
      );

      if (importLines.length > 0) {
        // Add import after existing imports
        const lastImportIndex = content.lastIndexOf(importLines[importLines.length - 1]);
        const afterLastImport = content.indexOf('\n', lastImportIndex) + 1;
        
        const importStatement = `import {\n  ${usedComponents.join(',\n  ')}\n} from '@/libs/design-system';\n`;
        
        updatedContent = content.slice(0, afterLastImport) + importStatement + content.slice(afterLastImport);
        fileUpdated = true;
      } else {
        // Add import at the beginning after 'use client' if it exists
        const useClientMatch = content.match(/^'use client';\s*\n/);
        if (useClientMatch) {
          const afterUseClient = useClientMatch[0].length;
          const importStatement = `\nimport {\n  ${usedComponents.join(',\n  ')}\n} from '@/libs/design-system';\n`;
          updatedContent = content.slice(0, afterUseClient) + importStatement + content.slice(afterUseClient);
        } else {
          const importStatement = `import {\n  ${usedComponents.join(',\n  ')}\n} from '@/libs/design-system';\n\n`;
          updatedContent = importStatement + content;
        }
        fileUpdated = true;
      }
    } else {
      // Update existing design system import to include missing components
      const importRegex = /import\s*{([^}]+)}\s*from\s*['"]@\/libs\/design-system['"];?/;
      const match = updatedContent.match(importRegex);
      
      if (match) {
        const existingImports = match[1]
          .split(',')
          .map(imp => imp.trim())
          .filter(imp => imp.length > 0);
        
        const newImports = usedComponents.filter(comp => !existingImports.includes(comp));
        
        if (newImports.length > 0) {
          const allImports = [...existingImports, ...newImports].sort();
          const newImportStatement = `import {\n  ${allImports.join(',\n  ')}\n} from '@/libs/design-system';`;
          
          updatedContent = updatedContent.replace(importRegex, newImportStatement);
          fileUpdated = true;
          console.log(`   Added: ${newImports.join(', ')}`);
        }
      }
    }

    if (fileUpdated) {
      fs.writeFileSync(filePath, updatedContent);
      totalUpdated++;
      console.log(`   ✅ Updated`);
    }
  }

  console.log(`\n🎉 Migration complete! Updated ${totalUpdated} files.`);
}

updateImports().catch(console.error);
