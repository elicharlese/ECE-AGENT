# STYLING GUIDE

## Overview

This guide outlines the styling system for the CASCADE AGENT project, including design tokens, cross-platform consistency, and best practices for maintaining a unified terminal-inspired aesthetic across web and mobile platforms.

## Design Tokens System

### Location
- **Tokens**: `libs/ui/theme/tokens.ts`
- **React Native Styles**: `libs/ui/theme/reactNativeStyles.ts`
- **Exports**: `libs/ui/theme/index.ts`

### Token Categories

#### Colors
Terminal-inspired color palette with light/dark theme variants:

```typescript
// Primary colors
primary: { light: '#3B82F6', dark: '#10B981' }

// Background colors
background: { light: '#F9FAFB', dark: '#000000' }
surface: { light: '#FFFFFF', dark: '#111827' }

// Text colors
text.primary: { light: '#111827', dark: '#10B981' }
text.secondary: { light: '#6B7280', dark: '#059669' }
text.muted: { light: '#9CA3AF', dark: '#047857' }

// Terminal-specific
terminal: {
  prompt: '#10B981',
  command: '#FFFFFF', 
  output: '#9CA3AF',
  cursor: '#10B981'
}
```

#### Spacing
Consistent spacing scale from `xs` (4px) to `5xl` (96px):
```typescript
spacing: {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  xl: '1.5rem',    // 24px
  '2xl': '2rem',   // 32px
  // ... up to 5xl
}
```

#### Typography
Font sizes, weights, and line heights:
```typescript
fontSize: { xs: '0.75rem', sm: '0.875rem', base: '1rem', ... }
fontWeight: { normal: '400', medium: '500', semibold: '600', bold: '700' }
lineHeight: { tight: '1.25', normal: '1.5', relaxed: '1.75' }
```

## Web Platform (Tailwind CSS)

### Configuration
The Tailwind configuration (`apps/web/tailwind.config.js`) extends the default theme with design tokens:

```javascript
const { designTokens } = require('../../libs/ui/theme/tokens');

module.exports = {
  theme: {
    extend: {
      colors: {
        primary: designTokens.colors.primary,
        background: designTokens.colors.background,
        // ... all token colors
      },
      spacing: designTokens.spacing,
      fontSize: designTokens.fontSize,
      // ... all other tokens
    }
  }
}
```

### Usage Examples
```tsx
// Using design token colors
<div className="bg-background-dark text-text-primary-dark">
  <button className="bg-primary-dark text-black font-bold px-xl py-md rounded-md">
    Terminal Button
  </button>
</div>

// Terminal-inspired styling
<div className="font-mono text-terminal-prompt bg-black p-lg">
  $ cascade-agent --help
</div>
```

## Mobile Platform (React Native)

### Style Creation
Use the provided style creators for consistent theming:

```typescript
import { createBaseStyles, createTerminalStyles, getThemeColor } from '@libs/ui/theme';

const styles = createBaseStyles('dark');
const terminalStyles = createTerminalStyles('dark');
```

### Usage Examples
```tsx
// Using generated styles
<View style={[styles.flex1, styles.bgPrimary]}>
  <Text style={[styles.textPrimary, styles.fontMono]}>
    CASCADE AGENT
  </Text>
  <TouchableOpacity style={[styles.button, styles.buttonPrimary]}>
    <Text style={styles.buttonText}>Execute</Text>
  </TouchableOpacity>
</View>

// Terminal-specific styling
<View style={terminalStyles.terminal}>
  <Text style={[terminalStyles.terminalText, terminalStyles.terminalPrompt]}>
    $ 
  </Text>
  <Text style={[terminalStyles.terminalText, terminalStyles.terminalCommand]}>
    npm start
  </Text>
</View>
```

## Component Library Standards

### Named Exports Only
All components in `libs/ui/**` use named exports per organization rules:

```typescript
// ✅ Correct
export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  // component implementation
};

// ❌ Incorrect
export default MainLayout;
```

### Barrel Exports
Each subdirectory has an `index.ts` file for clean imports:

```typescript
// libs/ui/pages/index.ts
export { Profile } from './Profile';
export { Settings } from './Settings';
export { Admin } from './Admin';
export { Login } from './Login';
```

### Import Patterns
```typescript
// ✅ Preferred - specific imports
import { MainLayout } from '@libs/ui/layout/MainLayout';
import { Profile } from '@libs/ui/pages/Profile';

// ✅ Acceptable - barrel imports
import { MainLayout, Profile } from '@libs/ui';

// ❌ Avoid - default imports (violates org rules)
import MainLayout from '@libs/ui/layout/MainLayout';
```

## Theme Context Integration

### Web Implementation
```tsx
import { useTheme } from '@libs/ui/contexts/ThemeContext';

const Component = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className={`${theme === 'dark' ? 'bg-background-dark text-text-primary-dark' : 'bg-background-light text-text-primary-light'}`}>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
};
```

### Mobile Implementation
```tsx
import { useTheme } from '@libs/ui/contexts/ThemeContext';
import { createBaseStyles } from '@libs/ui/theme';

const Component = () => {
  const { theme } = useTheme();
  const styles = createBaseStyles(theme);
  
  return (
    <View style={styles.bgPrimary}>
      <Text style={styles.textPrimary}>Themed Content</Text>
    </View>
  );
};
```

## Terminal Aesthetic Guidelines

### Color Scheme
- **Primary**: Green (#10B981) for active elements, prompts, and highlights
- **Background**: Pure black (#000000) for authentic terminal feel
- **Text**: Green variants for different hierarchy levels
- **Accents**: Blue (#3B82F6) for light theme compatibility

### Typography
- **Font Family**: Monospace fonts (Menlo, Monaco, Consolas)
- **Weight**: Bold for commands and prompts, normal for output
- **Case**: UPPERCASE for labels and buttons to mimic terminal commands

### Interactive Elements
- **Buttons**: Solid backgrounds with contrasting text
- **Inputs**: Border styling with terminal colors
- **Focus States**: Green border/outline for consistency
- **Hover States**: Subtle background color changes

## Cross-Platform Consistency

### Shared Components
Components in `libs/ui/**` should be platform-agnostic when possible:

```typescript
// ✅ Platform-agnostic component
export const TerminalButton: React.FC<TerminalButtonProps> = ({ 
  title, 
  onPress, 
  variant = 'primary' 
}) => {
  // Use conditional rendering or platform-specific styling
  return Platform.OS === 'web' ? (
    <button className={getButtonClasses(variant)} onClick={onPress}>
      {title}
    </button>
  ) : (
    <TouchableOpacity style={getButtonStyles(variant)} onPress={onPress}>
      <Text style={getButtonTextStyles(variant)}>{title}</Text>
    </TouchableOpacity>
  );
};
```

### Design Token Usage
Always use design tokens instead of hardcoded values:

```typescript
// ✅ Correct
const styles = {
  padding: designTokens.spacing.lg,
  fontSize: designTokens.fontSize.base,
  color: getThemeColor('text.primary', theme)
};

// ❌ Incorrect
const styles = {
  padding: 16,
  fontSize: 16,
  color: '#10B981'
};
```

## Build Integration

### Tailwind Build
The web build automatically includes design tokens through the Tailwind configuration. No additional setup required.

### React Native Build
Import styles at the component level:

```typescript
import { createBaseStyles, spacing, fontSize } from '@libs/ui/theme';
```

## Best Practices

### 1. Consistency
- Always use design tokens for colors, spacing, and typography
- Maintain the terminal aesthetic across all platforms
- Use the theme context for dynamic theming

### 2. Performance
- Create styles outside of render functions
- Use StyleSheet.create() for React Native
- Leverage Tailwind's utility classes for web

### 3. Maintainability
- Keep design tokens as the single source of truth
- Use named exports consistently
- Document any platform-specific styling decisions

### 4. Accessibility
- Ensure sufficient color contrast ratios
- Use semantic HTML elements on web
- Provide proper accessibility labels on mobile

## Future Enhancements

### Potential Additions
- **Animation tokens**: Standardized timing and easing functions
- **Elevation/shadows**: Consistent depth system
- **Component variants**: Pre-defined style combinations
- **Responsive utilities**: Breakpoint-aware styling helpers

### NativeWind Integration
Consider adopting NativeWind for React Native to use Tailwind utilities directly:

```bash
npm install nativewind
npm install --save-dev tailwindcss
```

This would allow using the same Tailwind classes across web and mobile platforms.

## Troubleshooting

### Common Issues
1. **Build errors with tokens**: Ensure CommonJS compatibility in Tailwind config
2. **Missing styles**: Check barrel exports and import paths
3. **Theme not applying**: Verify ThemeContext is properly wrapped around components
4. **Platform differences**: Use platform-specific conditional styling when needed

### Debug Tools
- Use browser dev tools to inspect Tailwind classes
- React Native Debugger for style inspection
- Console.log design token values to verify imports

---

This styling system ensures consistent, maintainable, and scalable design across the CASCADE AGENT platform while preserving the authentic terminal aesthetic that defines the user experience.
