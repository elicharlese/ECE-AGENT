#!/usr/bin/env tsx

/**
 * UI Migration Script
 * Updates import paths from old @/components/ui to new @/libs/design-system
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

// Mapping of old component imports to new design system imports
const IMPORT_MAPPINGS = {
  // Direct mappings
  'Button': 'Button',
  'Input': 'Input', 
  'Card': 'Card',
  'CardHeader': 'CardHeader',
  'CardContent': 'CardContent', 
  'CardFooter': 'CardFooter',
  'CardTitle': 'CardTitle',
  'CardDescription': 'CardDescription',
  'Dialog': 'Dialog',
  'DialogTrigger': 'DialogTrigger',
  'DialogContent': 'DialogContent',
  'DialogHeader': 'DialogHeader',
  'DialogFooter': 'DialogFooter',
  'DialogTitle': 'DialogTitle',
  'DialogDescription': 'DialogDescription',
  'DialogClose': 'DialogClose',
  'Badge': 'Badge',
  'Alert': 'Alert',
  'AlertTitle': 'AlertTitle',
  'AlertDescription': 'AlertDescription',
  'Avatar': 'Avatar',
  'AvatarImage': 'AvatarImage',
  'AvatarFallback': 'AvatarFallback',
  'Skeleton': 'Skeleton',
  
  // Layout components
  'AppShell': 'AppShell',
  'AppShellHeader': 'AppShellHeader',
  'AppShellSidebar': 'AppShellSidebar',
  'AppShellMain': 'AppShellMain',
  'AppShellFooter': 'AppShellFooter',
  'SidebarToggle': 'SidebarToggle',
  'PageLayout': 'PageLayout',
  'PageHeader': 'PageHeader',
  'PageContent': 'PageContent',
  'PageSection': 'PageSection',
  'PageSidebar': 'PageSidebar',
  'PageGrid': 'PageGrid',
  'PageHero': 'PageHero',
  
  // Hooks
  'useResponsive': 'useResponsive',
  'usePlatform': 'usePlatform',
  'useUserPreferences': 'useUserPreferences',
  'useBreakpoint': 'useBreakpoint',
  'useMediaQuery': 'useMediaQuery',
  'useWindowSize': 'useWindowSize',
  'useOrientation': 'useOrientation',
  
  // Components that need to be replaced with new equivalents
  'buttonVariants': 'buttonVariants',
  'cardVariants': 'cardVariants',
  'inputVariants': 'inputVariants',
  'badgeVariants': 'badgeVariants',
  'alertVariants': 'alertVariants',
  'skeletonVariants': 'skeletonVariants',
};

// Components that don't have direct equivalents yet (will need manual migration)
const DEPRECATED_COMPONENTS = [
  'Accordion',
  'AlertDialog', 
  'AspectRatio',
  'Breadcrumb',
  'Calendar',
  'Carousel',
  'Chart',
  'Checkbox',
  'Collapsible',
  'Command',
  'ContextMenu',
  'Drawer',
  'DropdownMenu',
  'Form',
  'HoverCard',
  'InputOTP',
  'Label',
  'Menubar',
  'NavigationMenu',
  'Pagination',
  'Popover',
  'Progress',
  'RadioGroup',
  'Resizable',
  'ScrollArea',
  'Select',
  'Separator',
  'Sheet',
  'Sidebar',
  'Slider',
  'Switch',
  'Table',
  'Tabs',
  'Textarea',
  'Toast',
  'Toaster',
  'Toggle',
  'ToggleGroup',
  'Tooltip',
  'use-mobile',
  'use-toast',
];

function getAllFiles(dir: string, extensions: string[] = ['.tsx', '.ts']): string[] {
  const files: string[] = [];
  
  function traverse(currentDir: string) {
    const items = readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = join(currentDir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and other irrelevant directories
        if (!item.startsWith('.') && 
            item !== 'node_modules' && 
            item !== 'dist' && 
            item !== 'build' &&
            item !== 'coverage') {
          traverse(fullPath);
        }
      } else if (extensions.includes(extname(item))) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

function updateImports(filePath: string): boolean {
  try {
    const content = readFileSync(filePath, 'utf-8');
    let updatedContent = content;
    let hasChanges = false;

    // Pattern to match imports from @/components/ui/
    const importPattern = /import\s*{([^}]+)}\s*from\s*['"]@\/components\/ui\/([^'"]+)['"]/g;
    
    updatedContent = updatedContent.replace(importPattern, (match, imports, componentPath) => {
      const importList = imports.split(',').map((imp: string) => imp.trim());
      const newImports: string[] = [];
      const deprecatedImports: string[] = [];
      
      for (const imp of importList) {
        const cleanImport = imp.replace(/\s+as\s+\w+/, '').trim();
        
        if (IMPORT_MAPPINGS[cleanImport]) {
          newImports.push(imp);
        } else if (DEPRECATED_COMPONENTS.includes(cleanImport)) {
          deprecatedImports.push(imp);
        } else {
          // Unknown component, keep as is for now
          newImports.push(imp);
        }
      }
      
      let result = '';
      
      if (newImports.length > 0) {
        result += `import { ${newImports.join(', ')} } from '@/libs/design-system'`;
        hasChanges = true;
      }
      
      if (deprecatedImports.length > 0) {
        // Add comment about deprecated components
        result += `\n// TODO: Replace deprecated components: ${deprecatedImports.join(', ')}\n`;
        result += `// import { ${deprecatedImports.join(', ')} } from '@/components/ui/${componentPath}'`;
        hasChanges = true;
      }
      
      return result;
    });

    // Also update any remaining @/components/ui/ imports that might not match the pattern
    const singleImportPattern = /import\s+(\w+)\s+from\s*['"]@\/components\/ui\/([^'"]+)['"]/g;
    updatedContent = updatedContent.replace(singleImportPattern, (match, importName, componentPath) => {
      if (IMPORT_MAPPINGS[importName]) {
        hasChanges = true;
        return `import { ${importName} } from '@/libs/design-system'`;
      } else if (DEPRECATED_COMPONENTS.includes(importName)) {
        hasChanges = true;
        return `// TODO: Replace deprecated component: ${importName}\n// ${match}`;
      }
      return match;
    });

    if (hasChanges) {
      writeFileSync(filePath, updatedContent, 'utf-8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
    return false;
  }
}

function main() {
  const projectRoot = process.cwd();
  const dirsToScan = [
    join(projectRoot, 'app'),
    join(projectRoot, 'components'),
    join(projectRoot, 'lib'),
    join(projectRoot, 'libs'),
  ];

  console.log('🚀 Starting UI import migration...\n');

  let totalFiles = 0;
  let updatedFiles = 0;

  for (const dir of dirsToScan) {
    try {
      const files = getAllFiles(dir);
      console.log(`📁 Scanning ${dir}: ${files.length} files`);
      
      for (const file of files) {
        totalFiles++;
        if (updateImports(file)) {
          updatedFiles++;
        }
      }
    } catch (error) {
      console.log(`⚠️  Skipping ${dir}: ${error.message}`);
    }
  }

  console.log(`\n✨ Migration complete!`);
  console.log(`📊 Updated ${updatedFiles} out of ${totalFiles} files`);
  
  if (updatedFiles > 0) {
    console.log(`\n📝 Next steps:`);
    console.log(`1. Review files with TODO comments for deprecated components`);
    console.log(`2. Test the application to ensure everything works`);
    console.log(`3. Remove old UI components from /components/ui/`);
    console.log(`4. Update any remaining manual imports`);
  }
}

if (require.main === module) {
  main();
}

export { updateImports, IMPORT_MAPPINGS, DEPRECATED_COMPONENTS };
